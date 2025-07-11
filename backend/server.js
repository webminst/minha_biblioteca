// server.js

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Importa as rotas
const sermonsRouter = require('./routes/sermons');
const studiesRouter = require('./routes/studies');
const booksRouter = require('./routes/books');
const authRouter = require('./routes/auth');


const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// --- Middlewares ---
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://seu-dominio.vercel.app', 'https://seu-dominio.netlify.app']
    : 'http://localhost:3000',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// --- Conexão com o MongoDB ---
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB!'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// --- Rotas da API ---
app.get('/', (req, res) => {
  res.send('API do Portfólio de Sermões e Estudos Bíblicos funcionando!');
});

// Usa as rotas para sermões e estudos
app.use('/api/sermons', sermonsRouter); // Todas as rotas em sermonsRouter serão prefixadas com /api/sermons
app.use('/api/studies', studiesRouter);   // Todas as rotas em studiesRouter serão prefixadas com /api/studies
app.use('/api/books', booksRouter);     // Todas as rotas em booksRouter serão prefixadas com /api/books
app.use('/api/auth', authRouter); // NOVO: Usa as rotas de autenticação (ex: /api/auth/login, /api/auth/register)

// --- Iniciar o Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});