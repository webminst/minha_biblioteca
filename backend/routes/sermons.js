// routes/sermons.js
const express = require('express');
const router = express.Router();
const Sermon = require('../models/Sermon');
const SermonService = require('../services/SermonService');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * Rotas para gerenciamento de sermões
 * CRUD completo para sermões e esboços bíblicos
 */

// ========== ROTAS PÚBLICAS ==========
// GET /api/sermons/count - Conta total de sermões
router.get('/count', async (req, res, next) => {
  try {
    const stats = await SermonService.getStats();
    res.json({ count: stats.totalSermons });
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons - Lista todos os sermões
router.get('/', async (req, res, next) => {
  try {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      book: req.query.book,
      series: req.query.series,
      speaker: req.query.speaker,
      search: req.query.search
    };

    const result = await SermonService.findAll(options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/latest - Busca o sermão mais recente
router.get('/latest', async (req, res, next) => {
  try {
    const latestSermon = await SermonService.findLatest();
    res.json(latestSermon);
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/stats - Estatísticas dos sermões
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await SermonService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/series - Lista todas as séries
router.get('/series', async (req, res, next) => {
  try {
    const series = await SermonService.getAllSeries();
    res.json(series);
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/speakers - Lista todos os pregadores
router.get('/speakers', async (req, res, next) => {
  try {
    const speakers = await SermonService.getAllSpeakers();
    res.json(speakers);
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/books - Lista todos os livros bíblicos
router.get('/books', async (req, res, next) => {
  try {
    const books = await SermonService.getAllBooks();
    res.json(books);
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/series/:name - Sermões por série específica
router.get('/series/:name', async (req, res, next) => {
  try {
    const sermons = await SermonService.findBySeries(req.params.name);
    res.json(sermons);
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/speaker/:name - Sermões por pregador específico
router.get('/speaker/:name', async (req, res, next) => {
  try {
    const sermons = await SermonService.findBySpeaker(req.params.name);
    res.json(sermons);
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/:id - Busca sermão específico por ID
router.get('/:id', async (req, res, next) => {
  try {
    const sermon = await SermonService.findById(req.params.id);
    res.json(sermon);
  } catch (error) {
    next(error);
  }
});

// ========== ROTAS PROTEGIDAS (ADMIN/EDITOR) ==========
// POST /api/sermons - Criar novo sermão
router.post('/', protect, authorizeRoles('admin', 'editor'), async (req, res, next) => {
  try {
    const savedSermon = await SermonService.create(req.body, req.user._id);
    res.status(201).json({
      ...savedSermon.toObject(),
      message: 'Sermão criado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/sermons/:id - Atualizar sermão existente
router.patch('/:id', protect, authorizeRoles('admin', 'editor'), async (req, res, next) => {
  try {
    const updatedSermon = await SermonService.update(req.params.id, req.body, req.user._id);
    res.json({
      ...updatedSermon.toObject(),
      message: 'Sermão atualizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// ========== ROTAS PROTEGIDAS (APENAS ADMIN) ==========
// DELETE /api/sermons/:id - Deletar sermão
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const result = await SermonService.delete(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ========== ROTA DE BUSCA ==========
// GET /api/sermons/search/:term - Buscar sermões por termo
router.get('/search/:term', async (req, res, next) => {
  try {
    const searchTerm = req.params.term;
    const result = await SermonService.findAll({ search: searchTerm });

    res.json({
      searchTerm,
      count: result.sermons.length,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;