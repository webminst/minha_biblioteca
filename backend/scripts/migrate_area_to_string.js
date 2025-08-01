// Script para migrar o campo 'area' de array para string em todos os livros
// Execute este script uma única vez após alterar o schema para area:string

const mongoose = require('mongoose');
const Book = require('../models/Book');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/minha_biblioteca';

async function migrateAreaToString() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Conectado ao MongoDB');

  // Busca livros onde area é array
  const books = await Book.find({ area: { $type: 'array' } });
  console.log(`Livros encontrados para migrar: ${books.length}`);

  for (const book of books) {
    if (Array.isArray(book.area) && book.area.length > 0) {
      // Pega apenas o primeiro valor não vazio
      const areaStr = book.area.find(a => typeof a === 'string' && a.trim() !== '') || '';
      book.area = areaStr;
      await book.save();
      console.log(`Livro '${book.title}' migrado para area: '${areaStr}'`);
    }
  }

  console.log('Migração concluída!');
  await mongoose.disconnect();
}

migrateAreaToString().catch(err => {
  console.error('Erro na migração:', err);
  process.exit(1);
});
