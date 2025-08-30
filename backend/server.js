// server.js

require('dotenv').config();

const express = require('express');

const mongoose = require('mongoose');
const cors = require('cors');

// Swagger (documentação automática)
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// NOVO: Importa configuração Redis
const { redis, getRedisStatus } = require('./config/redis');
const CachedBookService = require('./services/CachedBookService');
const CachedSermonService = require('./services/CachedSermonService');
const CachedStudyService = require('./services/CachedStudyService');

// Importa as rotas
const sermonsRouter = require('./routes/sermons');
const studiesRouter = require('./routes/studies');
const booksRouter = require('./routes/books');
const authRouter = require('./routes/auth');
const auth2faRouter = require('./routes/auth2fa'); // NOVO: Rotas 2FA
const securityRouter = require('./routes/security');
const auditRouter = require('./routes/audit'); // NOVO: Rotas de auditoria

// Importa middlewares de erro
const { globalErrorHandler, notFound, requestLogger } = require('./middleware/errorHandler');

// NOVO: Importa middlewares de auditoria
const {
  auditLogger,
  auditUserContext,
  auditErrorLogger,
  auditStatsCollector,
} = require('./middleware/auditLogger');



const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// --- Documentação Swagger ---
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Middlewares ---
const allowedOrigins = [process.env.CORS_ORIGIN || 'http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sem origin (ex: ferramentas locais, mobile) ou de origens permitidas
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Logger de requisições
app.use(requestLogger);

// NOVO: Middlewares de auditoria
app.use(auditStatsCollector()); // Coleta estatísticas
app.use(auditUserContext());    // Contexto de usuário (após auth)
app.use(auditLogger());         // Log de auditoria principal

// Aplica headers de segurança globalmente
const { applySecurityHeaders } = require('./middleware/jwtSecurity');
app.use(applySecurityHeaders);


// --- Conexão com o MongoDB e Redis, e warm-up de cache ---
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('✅ Conectado ao MongoDB!');
      // Inicializa conexão Redis após MongoDB
      return redis.connect();
    })
    .then(() => {
      console.log('🚀 Todas as conexões estabelecidas!');
      // Warm-up do cache em background
      setTimeout(async () => {
        try {
          console.log('🔥 Iniciando warm-up dos caches...');
          await Promise.allSettled([
            CachedBookService.warmUpCache(),
            CachedSermonService.warmUp(),
            CachedStudyService.warmUp(),
          ]);
          console.log('✅ Warm-up de todos os caches concluído!');
        } catch (err) {
          console.error('❌ Erro no warm-up:', err.message);
        }
      }, 2000);
    })
    .catch(err => {
      console.error('❌ Erro nas conexões:', err);
    });
}

// --- Rotas da API ---
app.get('/', (req, res) => {
  res.send('API do Portfólio de Sermões e Estudos Bíblicos funcionando!');
});

// NOVO: Rota de status da aplicação
app.get('/health', async (req, res) => {
  try {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const redisStatus = getRedisStatus();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
        redis: redisStatus,
      },
      version: '3.0.0',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
});

// NOVO: Rota de status dos caches
app.get('/cache-status', async (req, res) => {
  try {
    const [bookCache, sermonCache, studyCache] = await Promise.allSettled([
      CachedBookService.getCacheStatus(),
      CachedSermonService.getCacheStatus(),
      CachedStudyService.getCacheStatus(),
    ]);

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      caches: {
        books: bookCache.status === 'fulfilled' ? bookCache.value : { error: bookCache.reason?.message },
        sermons: sermonCache.status === 'fulfilled' ? sermonCache.value : { error: sermonCache.reason?.message },
        studies: studyCache.status === 'fulfilled' ? studyCache.value : { error: studyCache.reason?.message },
      },
      redis: getRedisStatus(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
});

// Usa as rotas para sermões e estudos
app.use('/api/sermons', sermonsRouter); // Todas as rotas em sermonsRouter serão prefixadas com /api/sermons
app.use('/api/studies', studiesRouter);   // Todas as rotas em studiesRouter serão prefixadas com /api/studies
app.use('/api/books', booksRouter);     // Todas as rotas em booksRouter serão prefixadas com /api/books
app.use('/api/auth', authRouter); // Usa as rotas de autenticação (ex: /api/auth/login, /api/auth/register)
app.use('/api/auth/2fa', auth2faRouter); // NOVO: Rotas de autenticação 2FA
app.use('/api/security', securityRouter); // NOVO: Rotas de monitoramento de segurança
app.use('/api/audit', auditRouter); // NOVO: Rotas de auditoria

// --- Middlewares de Erro (devem vir depois das rotas) ---
// NOVO: Middleware de auditoria para erros
app.use(auditErrorLogger);

// Middleware para rotas não encontradas
app.use(notFound);

// Middleware global de tratamento de erros
app.use(globalErrorHandler);


// --- Iniciar o Servidor (apenas fora de teste) ---
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Documentação Swagger disponível em http://localhost:${PORT}/api-docs`);
  });
}

// Exporta o app para testes
module.exports = app;
