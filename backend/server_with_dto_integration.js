// server_with_dto_integration.js
/**
 * EXEMPLO: Como integrar DTOs no server principal
 * Mostra as configurações necessárias para usar DTOs em produção
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Importa middleware de validação de DTOs
const { handleValidationErrors } = require('./middleware/dtoValidation');
const { ApiResponseDTO } = require('./dto');

const app = express();
const PORT = process.env.PORT || 5000;

// ========== MIDDLEWARES BÁSICOS ==========
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: ApiResponseDTO.error(
    'Muitas tentativas. Tente novamente em 15 minutos.',
    null,
    429,
  ),
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ========== CONEXÃO COM BANCO ==========
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pastor-portfolio', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB conectado com sucesso'))
  .catch(err => console.error('❌ Erro na conexão MongoDB:', err));

// ========== MIDDLEWARE DE LOGS ==========
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);

  // Log de dados validados (útil para debug)
  if (req.validatedData && process.env.NODE_ENV === 'development') {
    console.log('Dados validados:', JSON.stringify(req.validatedData, null, 2));
  }

  next();
});

// ========== ROTAS DA API ==========

// Importa rotas com DTOs (use suas rotas atualizadas)
const authRoutes = require('./routes/auth'); // ou auth_with_dto.js quando migrar
const booksRoutes = require('./routes/books'); // ou books_with_dto.js quando migrar
const sermonsRoutes = require('./routes/sermons');
const studiesRoutes = require('./routes/studies');

// Rota de health check com resposta padronizada
app.get('/health', (req, res) => {
  res.json(ApiResponseDTO.success(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
    'Sistema funcionando corretamente',
  ));
});

// Registra rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/sermons', sermonsRoutes);
app.use('/api/studies', studiesRoutes);

// ========== MIDDLEWARE DE ERRO GLOBAL ==========

// Middleware específico para erros de validação de DTOs
app.use(handleValidationErrors);

// Middleware global de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro capturado:', error);

  // Erro de validação do Mongoose
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
      value: err.value,
    }));

    return res.status(400).json(
      ApiResponseDTO.error(
        'Erro de validação do banco de dados',
        errors,
        400,
      ),
    );
  }

  // Erro de cast do MongoDB (ID inválido)
  if (error.name === 'CastError') {
    return res.status(400).json(
      ApiResponseDTO.error(
        'ID inválido',
        [{ field: error.path, message: 'Formato de ID inválido' }],
        400,
      ),
    );
  }

  // Erro de duplicata (índice único violado)
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(409).json(
      ApiResponseDTO.error(
        'Registro duplicado',
        [{ field, message: `${field} já existe` }],
        409,
      ),
    );
  }

  // Erro de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json(
      ApiResponseDTO.error(
        'Token inválido',
        null,
        401,
      ),
    );
  }

  // Erro de token expirado
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json(
      ApiResponseDTO.error(
        'Token expirado',
        null,
        401,
      ),
    );
  }

  // Erro customizado da aplicação
  if (error.isOperational) {
    return res.status(error.statusCode || 500).json(
      ApiResponseDTO.error(
        error.message,
        error.details || null,
        error.statusCode || 500,
      ),
    );
  }

  // Erro interno do servidor
  res.status(500).json(
    ApiResponseDTO.error(
      process.env.NODE_ENV === 'production'
        ? 'Erro interno do servidor'
        : error.message,
      process.env.NODE_ENV === 'development' ? error.stack : null,
      500,
    ),
  );
});

// ========== ROTA 404 ==========
app.use('*', (req, res) => {
  res.status(404).json(
    ApiResponseDTO.error(
      `Rota ${req.originalUrl} não encontrada`,
      null,
      404,
    ),
  );
});

// ========== INICIALIZAÇÃO DO SERVIDOR ==========
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);

  if (process.env.NODE_ENV === 'development') {
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`📚 API Books: http://localhost:${PORT}/api/books`);
  }
});

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado.');
    mongoose.connection.close(false, () => {
      console.log('Conexão MongoDB encerrada.');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido. Encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado.');
    mongoose.connection.close(false, () => {
      console.log('Conexão MongoDB encerrada.');
      process.exit(0);
    });
  });
});

// ========== TRATAMENTO DE PROMESSAS REJEITADAS ==========
process.on('unhandledRejection', (reason, promise) => {
  console.error('Promessa rejeitada não tratada:', reason);
  // Em produção, você pode querer encerrar o processo
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  console.error('Exceção não capturada:', error);
  process.exit(1);
});

module.exports = app;

/**
 * CONFIGURAÇÕES IMPORTANTES PARA DTOs:
 *
 * 1. VARIÁVEIS DE AMBIENTE (.env):
 * NODE_ENV=development
 * MONGODB_URI=mongodb://localhost:27017/pastor-portfolio
 * JWT_SECRET=your-super-secret-key
 * JWT_REFRESH_SECRET=your-refresh-secret-key
 *
 * 2. SCRIPTS NO package.json:
 * {
 *   "scripts": {
 *     "start": "node server.js",
 *     "dev": "nodemon server.js",
 *     "test": "jest",
 *     "test:dto": "jest tests/dto/"
 *   }
 * }
 *
 * 3. DEPENDÊNCIAS ADICIONAIS:
 * npm install joi helmet express-rate-limit
 *
 * 4. BENEFÍCIOS DA INTEGRAÇÃO:
 * - Validação automática em todas as rotas
 * - Respostas padronizadas em toda a API
 * - Tratamento consistente de erros
 * - Logs estruturados de validação
 * - Melhor experiência de desenvolvimento
 */
