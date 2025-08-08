const winston = require('winston');
const { combine, timestamp, printf, colorize, json, errors } = winston.format;
const path = require('path');
const fs = require('fs');
const DailyRotateFile = require('winston-daily-rotate-file');

// Diretório de logs
const logDir = path.join(__dirname, '../logs');

// Criar diretório de logs se não existir
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Formato de log para console
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  const stackString = stack ? `\n${stack}` : '';
  return `${timestamp} ${level}: ${message}${metaString}${stackString}`;
});

// Formato de log para arquivo
const fileFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...(Object.keys(meta).length && { meta }),
    ...(stack && { stack })
  });
});

// Filtro para logs de erro
const errorFilter = winston.format((info) => {
  return info.level === 'error' ? info : false;
});

// Filtro para logs de warning
const warnFilter = winston.format((info) => {
  return info.level === 'warn' ? info : false;
});

// Filtro para logs de info
const infoFilter = winston.format((info) => {
  return info.level === 'info' ? info : false;
});

// Criação do logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'pastor-portfolio' },
  transports: [
    // Console transport para desenvolvimento
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      ),
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    }),
    
    // Arquivo de log de erros
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: combine(errorFilter(), fileFormat),
    }),
    
    // Arquivo de log de avisos
    new DailyRotateFile({
      filename: path.join(logDir, 'warn-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'warn',
      format: combine(warnFilter(), fileFormat),
    }),
    
    // Arquivo de log de informações
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: combine(infoFilter(), fileFormat),
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logDir, 'rejections.log'),
      format: fileFormat,
    }),
  ],
  exitOnError: false,
});

// Se não estivermos em produção, também logamos para o console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      consoleFormat
    ),
    level: 'debug',
  }));
}

// Stream para o morgan (HTTP request logging)
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
