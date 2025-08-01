// Rota protegida para limpeza de áreas inválidas em livros
// Acesse via POST /admin/clean-invalid-areas (recomenda-se proteger com autenticação/admin)

const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// Middleware simples de proteção (ajuste conforme sua autenticação real)
function adminAuth(req, res, next) {
  // Exemplo: só permite se header x-admin-token estiver correto
  if (req.headers['x-admin-token'] === process.env.ADMIN_TOKEN) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Acesso negado' });
}

router.post('/clean-invalid-areas', adminAuth, async (req, res) => {
  try {
    const books = await Book.find({ area: /,/ });
    let updated = 0;
    for (const book of books) {
      if (typeof book.area === 'string' && book.area.includes(',')) {
        const firstArea = book.area.split(',')[0].trim();
        book.area = firstArea;
        await book.save();
        updated++;
      }
    }
    return res.json({ success: true, updated, message: 'Limpeza concluída!' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erro na limpeza', error: err.message });
  }
});

module.exports = router;
