// routes/studies.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Adicione esta linha

// Rota para CRIAR um novo sermão (POST) - PROTEGIDA
router.post('/', protect, authorizeRoles('admin', 'editor'), async (req, res) => {
  try {
    const newBook = new Book(req.body);
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota para LER todos os livros (GET)
router.get('/', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para LER o último livro (GET)
router.get('/latest', async (req, res) => {
  try {
    const latestBook = await Book.findOne().sort({ createdAt: -1 }); // Ordena por data de criação descrescente
    if (!latestBook) return res.status(404).json({ message: 'Nenhum livro encontrado' });
    res.status(200).json(latestBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para LER um livro específico pelo ID (GET)
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livro não encontrado' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para ATUALIZAR um sermão pelo ID (PATCH/PUT) - PROTEGIDA
router.patch('/:id', protect, authorizeRoles('admin', 'editor'), async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBook) return res.status(404).json({ message: 'Livro não encontrado.' });
    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota para DELETAR um sermão pelo ID (DELETE) - PROTEGIDA
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => { // Apenas admin pode deletar
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) return res.status(404).json({ message: 'Livro não encontrado.' });
    res.status(200).json({ message: 'Livro excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;