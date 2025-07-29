// Script para migrar o campo 'area' de string para array em todos os livros
// Execute este script uma única vez após alterar o schema

const mongoose = require('mongoose');
const Book = require('../models/Book');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/minha_biblioteca';

async function migrateAreaToArray() {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conectado ao MongoDB');

    // Busca livros onde area é string
    const books = await Book.find({ area: { $type: 'string' } });
    console.log(`Livros encontrados para migrar: ${books.length}`);

    for (const book of books) {
        if (typeof book.area === 'string' && book.area.trim() !== '') {
            // Separa por vírgula, remove espaços extras e ignora vazios
            const areasArr = book.area.split(',').map(a => a.trim()).filter(Boolean);
            book.area = areasArr;
            await book.save();
            console.log(`Livro '${book.title}' migrado para area: [${areasArr.join(', ')}]`);
        }
    }

    console.log('Migração concluída!');
    await mongoose.disconnect();
}

migrateAreaToArray().catch(err => {
    console.error('Erro na migração:', err);
    process.exit(1);
});
