const express = require('express');
const router = express.Router();
const Sermon = require('../models/Sermon');
const SermonService = require('../services/CachedSermonService');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// DTOs
const { CreateSermonDTO, UpdateSermonDTO } = require('../dto/sermons/SermonDTO');
const { ApiResponseDTO, PaginationDTO } = require('../dto/common/ResponseDTO');

// Middleware de validação
const { validateInput, validateId, transformOutput } = require('../middleware/dtoValidation');

/**
 * Rotas para gerenciamento de sermões
 * CRUD completo para sermões e esboços bíblicos
 */

// ========== ROTAS PÚBLICAS ==========
// GET /api/sermons/count - Conta total de sermões
router.get('/count', cacheMiddleware('stats'), async (req, res, next) => {
  try {
    const stats = await SermonService.getStats();
    res.json(ApiResponseDTO.success({ count: stats.totalSermons }, 'Contagem de sermões obtida com sucesso'));
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons - Lista todos os sermões
router.get('/', cacheMiddleware('list'), async (req, res, next) => {
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

    // Criar paginação padronizada
    // Corrigido: usa o campo correto de total de itens
    const totalItems = (result.pagination && result.pagination.total) || result.total || result.totalSermons || 0;
    const pagination = new PaginationDTO({
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      totalItems
    });

    const paginationResult = pagination.validate();
    if (!paginationResult.isValid) {
      throw new Error('Erro na paginação');
    }

    const paginationData = pagination.transform();

    res.json(ApiResponseDTO.paginated(
      result.sermons,
      paginationData,
      'Sermões listados com sucesso'
    ));
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/latest - Busca o sermão mais recente
router.get('/latest', cacheMiddleware('stats'), async (req, res, next) => {
  try {
    const latestSermon = await SermonService.findLatest();
    res.json(ApiResponseDTO.success(latestSermon, 'Último sermão obtido com sucesso'));
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/stats - Estatísticas dos sermões
router.get('/stats', cacheMiddleware('stats'), async (req, res, next) => {
  try {
    const stats = await SermonService.getStats();
    res.json(ApiResponseDTO.success(stats, 'Estatísticas obtidas com sucesso'));
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/series - Lista todas as séries
router.get('/series', cacheMiddleware('stats'), async (req, res, next) => {
  try {
    const series = await SermonService.getAllSeries();
    res.json(ApiResponseDTO.success(series, 'Séries obtidas com sucesso'));
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/speakers - Lista todos os pregadores
router.get('/speakers', cacheMiddleware('stats'), async (req, res, next) => {
  try {
    const speakers = await SermonService.getAllSpeakers();
    res.json(ApiResponseDTO.success(speakers, 'Pregadores obtidos com sucesso'));
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/books - Lista todos os livros bíblicos
router.get('/books', cacheMiddleware('stats'), async (req, res, next) => {
  try {
    const books = await SermonService.getAllBooks();
    res.json(ApiResponseDTO.success(books, 'Livros bíblicos obtidos com sucesso'));
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/series/:name - Sermões por série específica
router.get('/series/:name', cacheMiddleware('filter'), async (req, res, next) => {
  try {
    const sermons = await SermonService.findBySeries(req.params.name);
    res.json(ApiResponseDTO.success(sermons, `Sermões da série '${req.params.name}' obtidos com sucesso`));
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/speaker/:name - Sermões por pregador específico
router.get('/speaker/:name', cacheMiddleware('filter'), async (req, res, next) => {
  try {
    const sermons = await SermonService.findBySpeaker(req.params.name);
    res.json(ApiResponseDTO.success(sermons, `Sermões do pregador '${req.params.name}' obtidos com sucesso`));
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/search/:term - Buscar sermões por termo
router.get('/search/:term', cacheMiddleware('filter'), async (req, res, next) => {
  try {
    const searchTerm = req.params.term;
    const result = await SermonService.findAll({ search: searchTerm });

    res.json(ApiResponseDTO.success({
      searchTerm,
      count: result.sermons.length,
      data: result.sermons,
      pagination: result.pagination
    }, `Busca por '${searchTerm}' realizada com sucesso`));
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/:id - Busca sermão específico por ID
router.get('/:id', validateId, async (req, res) => {
  try {
    const sermon = await SermonService.findById(req.params.id);
    res.json(ApiResponseDTO.success(sermon, 'Sermão obtido com sucesso'));
  } catch (error) {
    res.status(error.statusCode || 500).json(
      ApiResponseDTO.error(error.message || 'Erro interno', null, error.statusCode || 500)
    );
  }
});

// ========== ROTAS PROTEGIDAS (ADMIN/EDITOR) ==========
// POST /api/sermons - Criar novo sermão
router.post('/',
  protect,
  authorizeRoles('admin', 'editor'),
  validateInput(CreateSermonDTO),
  async (req, res, next) => {
    try {
      const savedSermon = await SermonService.create(req.validatedData, req.user._id);
      res.status(201).json(ApiResponseDTO.success(savedSermon, 'Sermão criado com sucesso'));
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/sermons/:id - Atualizar sermão existente
router.put('/:id',
  protect,
  authorizeRoles('admin', 'editor'),
  validateId,
  validateInput(UpdateSermonDTO),
  async (req, res, next) => {
    try {
      const updatedSermon = await SermonService.update(req.params.id, req.validatedData, req.user._id);
      res.json(ApiResponseDTO.success(updatedSermon, 'Sermão atualizado com sucesso'));
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/sermons/:id - Atualizar sermão existente (compatibilidade)
router.patch('/:id',
  protect,
  authorizeRoles('admin', 'editor'),
  validateId,
  validateInput(UpdateSermonDTO),
  async (req, res, next) => {
    try {
      const updatedSermon = await SermonService.update(req.params.id, req.validatedData, req.user._id);
      res.json(ApiResponseDTO.success(updatedSermon, 'Sermão atualizado com sucesso'));
    } catch (error) {
      next(error);
    }
  }
);

// ========== ROTAS PROTEGIDAS (APENAS ADMIN) ==========
// DELETE /api/sermons/:id - Deletar sermão
router.delete('/:id',
  protect,
  authorizeRoles('admin'),
  validateId,
  async (req, res, next) => {
    try {
      const result = await SermonService.delete(req.params.id);
      res.json(ApiResponseDTO.success(result, 'Sermão deletado com sucesso'));
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;