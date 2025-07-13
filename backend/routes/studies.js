// routes/studies.js
const express = require('express');
const router = express.Router();
const Study = require('../models/Study');
const StudyService = require('../services/StudyService');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * Rotas para gerenciamento de estudos bíblicos
 * CRUD completo para estudos e materiais didáticos
 */

// ========== ROTAS PÚBLICAS ==========
// GET /api/studies/count - Conta total de estudos
router.get('/count', async (req, res, next) => {
  try {
    const stats = await StudyService.getStats();
    res.json({ count: stats.totalStudies });
  } catch (error) {
    next(error);
  }
});

// GET /api/studies - Lista todos os estudos
router.get('/', async (req, res, next) => {
  try {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      theme: req.query.theme,
      format: req.query.format,
      reference: req.query.reference,
      search: req.query.search
    };

    const result = await StudyService.findAll(options);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/latest - Busca o estudo mais recente
router.get('/latest', async (req, res, next) => {
  try {
    const latestStudy = await StudyService.findLatest();
    res.json(latestStudy);
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/stats - Estatísticas dos estudos
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await StudyService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/themes - Lista todos os temas
router.get('/themes', async (req, res, next) => {
  try {
    const themes = await StudyService.getAllThemes();
    res.json(themes);
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/formats - Lista todos os formatos
router.get('/formats', async (req, res, next) => {
  try {
    const formats = await StudyService.getAllFormats();
    res.json(formats);
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/references - Lista todas as referências bíblicas
router.get('/references', async (req, res, next) => {
  try {
    const references = await StudyService.getAllReferences();
    res.json(references);
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/popular - Estudos populares
router.get('/popular', async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;
    const studies = await StudyService.findPopular(limit);
    res.json(studies);
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/:id - Busca estudo específico por ID
router.get('/:id', async (req, res, next) => {
  try {
    const study = await StudyService.findById(req.params.id);
    res.json(study);
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/theme/:theme - Estudos por tema específico
router.get('/theme/:theme', async (req, res, next) => {
  try {
    const studies = await StudyService.findByTheme(req.params.theme);
    res.json(studies);
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/format/:format - Estudos por formato específico
router.get('/format/:format', async (req, res, next) => {
  try {
    const studies = await StudyService.findByFormat(req.params.format);
    res.json(studies);
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/:id/related - Estudos relacionados
router.get('/:id/related', async (req, res, next) => {
  try {
    const limit = req.query.limit || 5;
    const relatedStudies = await StudyService.findRelated(req.params.id, limit);
    res.json(relatedStudies);
  } catch (error) {
    next(error);
  }
});

// ========== ROTAS PROTEGIDAS (ADMIN/EDITOR) ==========
// POST /api/studies - Criar novo estudo
router.post('/', protect, authorizeRoles('admin', 'editor'), async (req, res, next) => {
  try {
    const savedStudy = await StudyService.create(req.body, req.user._id);
    res.status(201).json({
      ...savedStudy.toObject(),
      message: 'Estudo criado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/studies/:id - Atualizar estudo existente
router.patch('/:id', protect, authorizeRoles('admin', 'editor'), async (req, res, next) => {
  try {
    const updatedStudy = await StudyService.update(req.params.id, req.body, req.user._id);
    res.json({
      ...updatedStudy.toObject(),
      message: 'Estudo atualizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

// ========== ROTAS PROTEGIDAS (APENAS ADMIN) ==========
// DELETE /api/studies/:id - Deletar estudo
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const result = await StudyService.delete(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ========== ROTA DE BUSCA ==========
// GET /api/studies/search/:term - Buscar estudos por termo
router.get('/search/:term', async (req, res, next) => {
  try {
    const searchTerm = req.params.term;
    const result = await StudyService.findAll({ search: searchTerm });

    res.json({
      searchTerm,
      count: result.studies.length,
      ...result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;