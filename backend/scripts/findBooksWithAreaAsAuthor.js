// Script para encontrar livros onde o campo 'author' está preenchido com valores de área
// e opcionalmente corrigi-los

const mongoose = require('mongoose');
const Book = require('../models/Book');

// Configure sua string de conexão MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/minha_biblioteca';

async function main() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Conectado ao MongoDB');

  // Busca todos os valores únicos de área e autor
  const allAreas = await Book.distinct('area');
  const allAuthors = await Book.distinct('author');
  console.log('Áreas únicas encontradas:', allAreas);
  console.log('Autores únicos encontrados:', allAuthors);

  // Busca livros onde o campo author é igual a alguma área
  const booksWithAreaAsAuthor = await Book.find({ author: { $in: allAreas } });
  // Busca livros onde o campo area é igual a algum autor
  const booksWithAuthorAsArea = await Book.find({ area: { $in: allAuthors } });

  if (booksWithAreaAsAuthor.length === 0 && booksWithAuthorAsArea.length === 0) {
    console.log('Nenhum livro com área no campo author ou autor no campo area.');
    process.exit(0);
  }

  if (booksWithAreaAsAuthor.length > 0) {
    console.log(`Foram encontrados ${booksWithAreaAsAuthor.length} livros com área no campo author:`);
    booksWithAreaAsAuthor.forEach(book => {
      console.log(`- ID: ${book._id}, Título: ${book.title}, Author: ${book.author}, Área: ${book.area}`);
    });
  }

  if (booksWithAuthorAsArea.length > 0) {
    console.log(`Foram encontrados ${booksWithAuthorAsArea.length} livros com autor no campo area:`);
    booksWithAuthorAsArea.forEach(book => {
      console.log(`- ID: ${book._id}, Título: ${book.title}, Author: ${book.author}, Área: ${book.area}`);
    });
  }

  // Pergunta ao usuário se deseja corrigir
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Deseja limpar os campos trocados desses livros? (s/n): ', async (answer) => {
    if (answer.trim().toLowerCase() === 's') {
      for (const book of booksWithAreaAsAuthor) {
        // Se o campo area estiver vazio, mova o valor de author para area
        if (!book.area || book.area.trim() === '') {
          book.area = book.author;
        }
        book.author = '';
        await book.save();
        console.log(`Corrigido (author->area) livro ID: ${book._id}`);
      }
      for (const book of booksWithAuthorAsArea) {
        // Se o campo author estiver vazio, mova o valor de area para author
        if (!book.author || book.author.trim() === '') {
          book.author = book.area;
        }
        book.area = '';
        await book.save();
        console.log(`Corrigido (area->author) livro ID: ${book._id}`);
      }
      console.log('Todos os livros foram corrigidos e os valores trocados foram realocados.');
    } else {
      console.log('Nenhuma alteração foi feita.');
    }
    rl.close();
    mongoose.disconnect();
  });
}

main().catch(err => {
  console.error('Erro ao executar script:', err);
  process.exit(1);
});
