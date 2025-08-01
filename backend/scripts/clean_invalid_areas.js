// Script para limpar áreas inválidas (com vírgula) e manter apenas a primeira área válida
// Execute este script uma única vez após garantir que o schema aceita apenas string


// Usa a configuração centralizada do mongoose
const mongoose = require('../config/redis.js').mongoose || require('mongoose');
const Book = require('../models/Book');
const connectDB = require('../config/redis.js').connectDB || (async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/minha_biblioteca';
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

async function cleanInvalidAreas() {
  await connectDB();
  console.log('Conectado ao MongoDB');

  // Busca livros onde area contém vírgula
  const books = await Book.find({ area: /,/ });
  console.log(`Livros encontrados para corrigir: ${books.length}`);

  for (const book of books) {
    if (typeof book.area === 'string' && book.area.includes(',')) {
      const firstArea = book.area.split(',')[0].trim();
      book.area = firstArea;
      await book.save();
      console.log(`Livro '${book.title}' corrigido para area: '${firstArea}'`);
    }
  }

  console.log('Limpeza concluída!');
  await mongoose.disconnect();
}

cleanInvalidAreas().catch(err => {
  console.error('Erro na limpeza:', err);
  process.exit(1);
});
