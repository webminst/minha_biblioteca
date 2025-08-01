// backend/middleware/errorHandler.js
const jwt = require('jsonwebtoken');

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

/**
 * Tratamento de erros de cast do MongoDB
 */
const handleCastErrorDB = (err) => {
  const message = `ID inválido: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Tratamento de erros de duplicação do MongoDB
 */
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Campo duplicado: ${value}. Use outro valor!`;
  return new AppError(message, 400);
};

/**
 * Tratamento de erros de validação do MongoDB
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Dados inválidos: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Tratamento de erros de JWT
 */
const handleJWTError = () =>
  new AppError('Token inválido. Faça login novamente!', 401);

const handleJWTExpiredError = () =>
  new AppError('Token expirado. Faça login novamente!', 401);

/**
 * Envia erro detalhado em desenvolvimento
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Envia erro simplificado em produção
 */
const sendErrorProd = (err, res) => {
  // Erro operacional: enviar mensagem para cliente
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Erro de programação: não vazar detalhes
  else {
    console.error('ERROR 💥:', err);
    res.status(500).json({
      status: 'error',
      message: 'Algo deu errado!',
    });
  }
};

/**
 * Middleware principal de tratamento de erros
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Tratamento específico para diferentes tipos de erro
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

/**
 * Middleware para capturar rotas não encontradas
 */
const notFound = (req, res, next) => {
  const message = `Rota ${req.originalUrl} não encontrada neste servidor`;
  next(new AppError(message, 404));
};

/**
 * Wrapper para funções assíncronas
 * Evita ter que escrever try/catch em cada rota
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Logger de requisições
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    };

    // Log colorido baseado no status
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(
      `${statusColor}${req.method} ${req.originalUrl} ${res.statusCode}${reset} - ${duration}ms`,
    );

    // Em produção, você pode enviar isso para um serviço de logging
    if (process.env.NODE_ENV === 'production') {
      // Exemplo: winston.info(logData);
    }
  });

  next();
};

module.exports = {
  AppError,
  globalErrorHandler,
  notFound,
  catchAsync,
  requestLogger,
};
