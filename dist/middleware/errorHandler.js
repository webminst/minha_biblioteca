"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.sendErrorProd = exports.sendErrorDev = exports.handleJWTExpiredError = exports.handleJWTError = exports.handleValidationErrorDB = exports.handleDuplicateFieldsDB = exports.handleCastErrorDB = exports.AppError = void 0;
/**
 * Middleware global de tratamento de erros
 * Centraliza o tratamento de todos os tipos de erro da aplicação
 */
/**
 * Classe para erros customizados da aplicação
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * Tratamento de erros de cast do MongoDB
 */
const handleCastErrorDB = (err) => {
    const message = `ID inválido: ${err.value}`;
    return new AppError(message, 400);
};
exports.handleCastErrorDB = handleCastErrorDB;
/**
 * Tratamento de erros de duplicação do MongoDB
 */
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Campo duplicado: ${value}. Use outro valor!`;
    return new AppError(message, 400);
};
exports.handleDuplicateFieldsDB = handleDuplicateFieldsDB;
/**
 * Tratamento de erros de validação do MongoDB
 */
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Dados inválidos: ${errors.join('. ')}`;
    return new AppError(message, 400);
};
exports.handleValidationErrorDB = handleValidationErrorDB;
/**
 * Tratamento de erros de JWT
 */
const handleJWTError = () => new AppError('Token inválido. Faça login novamente!', 401);
exports.handleJWTError = handleJWTError;
const handleJWTExpiredError = () => new AppError('Token expirado. Faça login novamente!', 401);
exports.handleJWTExpiredError = handleJWTExpiredError;
/**
 * Envia erro detalhado em desenvolvimento
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        error: err,
        message: err.message,
        stack: err.stack
    });
};
exports.sendErrorDev = sendErrorDev;
/**
 * Envia erro simplificado em produção
 */
const sendErrorProd = (err, res) => {
    // Erros operacionais conhecidos
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    else {
        // Erros desconhecidos
        res.status(500).json({
            status: 'error',
            message: 'Erro interno do servidor'
        });
    }
};
exports.sendErrorProd = sendErrorProd;
/**
 * Middleware global de tratamento de erros
 */
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        (0, exports.sendErrorDev)(err, res);
    }
    else {
        let error = { ...err };
        error.message = err.message;
        if (err.name === 'CastError')
            error = (0, exports.handleCastErrorDB)(error);
        if (err.code === 11000)
            error = (0, exports.handleDuplicateFieldsDB)(error);
        if (err.name === 'ValidationError')
            error = (0, exports.handleValidationErrorDB)(error);
        if (err.name === 'JsonWebTokenError')
            error = (0, exports.handleJWTError)();
        if (err.name === 'TokenExpiredError')
            error = (0, exports.handleJWTExpiredError)();
        (0, exports.sendErrorProd)(error, res);
    }
};
exports.globalErrorHandler = globalErrorHandler;
