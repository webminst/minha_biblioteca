// routes/studies.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

/**
 * Rotas para gerenciamento de livros/resumos
 * CRUD completo para resumos de livros teológicos
 */

// ========== ROTAS PÚBLICAS ==========
// GET /api/books/count - Conta total de livros
router.get('/count', async (req, res) => {
  try {
    const count = await Book.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Erro ao contar livros:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/books - Lista todos os livros
router.get('/', async (req, res) => {
  try {
    const books = await Book.find()
      .sort({ createdAt: -1 })
      .select('title author publisher area description tags coverImageUrl createdAt updatedAt');

    res.json(books);
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/books/latest - Busca o livro mais recente
// ⚠️ IMPORTANTE: Esta rota DEVE vir ANTES de /:id
router.get('/latest', async (req, res) => {
  try {
    const latestBook = await Book.findOne()
      .sort({ createdAt: -1 })
      .select('title author publisher area description');

    if (!latestBook) {
      return res.status(404).json({
        message: 'Nenhum livro encontrado'
      });
    }

    res.json(latestBook);
  } catch (error) {
    console.error('Erro ao buscar último livro:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/books/search/:term - Buscar livros por termo
// ⚠️ IMPORTANTE: Rotas específicas devem vir ANTES de /:id
router.get('/search/:term', async (req, res) => {
  try {
    const searchTerm = req.params.term;
    const books = await Book.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { author: { $regex: searchTerm, $options: 'i' } },
        { area: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    })
      .sort({ createdAt: -1 })
      .select('title author publisher area description tags coverImageUrl createdAt');

    res.json({
      searchTerm,
      count: books.length,
      books
    });
  } catch (error) {
    console.error('Erro na busca de livros:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/books/:id - Busca livro específico por ID
// ⚠️ Esta rota deve vir POR ÚLTIMO entre as rotas GET
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        message: 'Livro não encontrado'
      });
    }

    res.json(book);
  } catch (error) {
    console.error('Erro ao buscar livro:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'ID de livro inválido'
      });
    }

    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// ========== ROTAS PROTEGIDAS (ADMIN) ==========
// POST /api/books - Criar novo livro
router.post('/', async (req, res) => {
  try {
    const book = new Book(req.body);
    const savedBook = await book.save();

    res.status(201).json({
      ...savedBook.toObject(),
      message: 'Livro criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar livro:', error);

    // Erro de validação
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/books/:id - Atualizar livro existente
router.put('/:id', async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Retorna documento atualizado
        runValidators: true // Executa validações do schema
      }
    );

    if (!updatedBook) {
      return res.status(404).json({
        message: 'Livro não encontrado'
      });
    }

    res.json({
      ...updatedBook.toObject(),
      message: 'Livro atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar livro:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'ID de livro inválido'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/books/:id - Deletar livro
router.delete('/:id', async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.status(404).json({
        message: 'Livro não encontrado'
      });
    }

    res.json({
      message: 'Livro deletado com sucesso',
      deletedBook: {
        _id: deletedBook._id,
        title: deletedBook.title
      }
    });
  } catch (error) {
    console.error('Erro ao deletar livro:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'ID de livro inválido'
      });
    }

    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;