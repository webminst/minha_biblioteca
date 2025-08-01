// routes/books.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const BookService = require('../services/BookService');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * Rotas para gerenciamento de livros/resumos
 * CRUD completo para resumos de livros teológicos
 */

// ========== ROTAS PÚBLICAS ==========
// GET /api/books/count - Conta total de livros
router.get('/count', async (req, res, next) => {
  try {
    const stats = await BookService.getStats();
    res.json({ count: stats.totalBooks });
  } catch (error) {
    next(error);
  }
});

// GET /api/books - Lista todos os livros
router.get('/', async (req, res, next) => {
  try {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      author: req.query.author,
      area: req.query.area,
      publisher: req.query.publisher,
      series: req.query.series,
      search: req.query.search,
    };

    const result = await BookService.findAll(options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/books/latest - Busca o livro mais recente
// ⚠️ IMPORTANTE: Esta rota DEVE vir ANTES de /:id
router.get('/latest', async (req, res, next) => {
  try {
    const latestBook = await BookService.findLatest();
    res.json(latestBook);
  } catch (error) {
    next(error);
  }
});

// GET /api/books/search/:term - Buscar livros por termo
// ⚠️ IMPORTANTE: Rotas específicas devem vir ANTES de /:id
router.get('/search/:term', async (req, res, next) => {
  try {
    const searchTerm = req.params.term;
    const result = await BookService.findAll({ search: searchTerm });

    res.json({
      searchTerm,
      count: result.books.length,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/books/stats - Estatísticas dos livros
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await BookService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// GET /api/books/authors - Lista todos os autores
router.get('/authors', async (req, res, next) => {
  try {
    const authors = await BookService.getAllAuthors();
    res.json(authors);
  } catch (error) {
    next(error);
  }
});

// GET /api/books/areas - Lista todas as áreas
router.get('/areas', async (req, res, next) => {
  try {
    const areas = await BookService.getAllAreas();
    res.json(areas);
  } catch (error) {
    next(error);
  }
});

// GET /api/books/publishers - Lista todas as editoras
router.get('/publishers', async (req, res, next) => {
  try {
    const publishers = await BookService.getAllPublishers();
    res.json(publishers);
  } catch (error) {
    next(error);
  }
});

// GET /api/books/series - Lista todas as séries
router.get('/series', async (req, res, next) => {
  try {
    const series = await BookService.getAllSeries();
    res.json(series);
  } catch (error) {
    next(error);
  }
});

// GET /api/books/popular - Livros populares
router.get('/popular', async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;
    const books = await BookService.findPopular(limit);
    res.json(books);
  } catch (error) {
    next(error);
  }
});

// GET /api/books/author/:name - Livros por autor específico
router.get('/author/:name', async (req, res, next) => {
  try {
    const books = await BookService.findByAuthor(req.params.name);
    res.json(books);
  } catch (error) {
    next(error);
  }
});

// GET /api/books/area/:area - Livros por área específica
router.get('/area/:area', async (req, res, next) => {
  try {
    const books = await BookService.findByArea(req.params.area);
    res.json(books);
  } catch (error) {
    next(error);
  }
});

// GET /api/books/:id/related - Livros relacionados
router.get('/:id/related', async (req, res, next) => {
  try {
    const limit = req.query.limit || 5;
    const relatedBooks = await BookService.findRelated(req.params.id, limit);
    res.json(relatedBooks);
  } catch (error) {
    next(error);
  }
});

// GET /api/books/:id - Busca livro específico por ID
// ⚠️ Esta rota deve vir POR ÚLTIMO entre as rotas GET
router.get('/:id', async (req, res, next) => {
  try {
    const book = await BookService.findById(req.params.id);
    res.json(book);
  } catch (error) {
    next(error);
  }
});

// ========== ROTAS PROTEGIDAS (ADMIN) ==========
// POST /api/books - Criar novo livro
router.post('/', protect, authorizeRoles('admin', 'editor'), async (req, res, next) => {
  try {
    const savedBook = await BookService.create(req.body, req.user._id);
    res.status(201).json({
      ...savedBook.toObject(),
      message: 'Livro criado com sucesso',
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/books/:id - Atualizar livro existente
router.put('/:id', protect, authorizeRoles('admin', 'editor'), async (req, res, next) => {
  try {
    const updatedBook = await BookService.update(req.params.id, req.body, req.user._id);
    res.json({
      ...updatedBook.toObject(),
      message: 'Livro atualizado com sucesso',
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/books/:id - Deletar livro
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const result = await BookService.delete(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
