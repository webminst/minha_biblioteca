import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Middleware global de tratamento de erros
 * Centraliza o tratamento de todos os tipos de erro da aplicação
 */

/**
 * Classe para erros customizados da aplicação
 */
export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Tratamento de erros de cast do MongoDB
 */
export const handleCastErrorDB = (err: any) => {
    const message = `ID inválido: ${err.value}`;
    return new AppError(message, 400);
};

/**
 * Tratamento de erros de duplicação do MongoDB
 */
export const handleDuplicateFieldsDB = (err: any) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Campo duplicado: ${value}. Use outro valor!`;
    return new AppError(message, 400);
};

/**
 * Tratamento de erros de validação do MongoDB
 */
export const handleValidationErrorDB = (err: any) => {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    const message = `Dados inválidos: ${errors.join('. ')}`;
    return new AppError(message, 400);
};

/**
 * Tratamento de erros de JWT
 */
export const handleJWTError = () =>
    new AppError('Token inválido. Faça login novamente!', 401);

export const handleJWTExpiredError = () =>
    new AppError('Token expirado. Faça login novamente!', 401);

/**
 * Envia erro detalhado em desenvolvimento
 */
export const sendErrorDev = (err: any, res: Response) => {
    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        error: err,
        message: err.message,
        stack: err.stack
    });
};

/**
 * Envia erro simplificado em produção
 */
export const sendErrorProd = (err: any, res: Response) => {
    // Erros operacionais conhecidos
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        // Erros desconhecidos
        res.status(500).json({
            status: 'error',
            message: 'Erro interno do servidor'
        });
    }
};

/**
 * Middleware global de tratamento de erros
 */
export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        if (err.name === 'CastError') error = handleCastErrorDB(error);
        if (err.code === 11000) error = handleDuplicateFieldsDB(error);
        if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (err.name === 'JsonWebTokenError') error = handleJWTError();
        if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};
