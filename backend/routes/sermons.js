/**
 * @swagger
 * /api/sermons/{id}:
 *   get:
 *     summary: Detalhes de um sermão por ID
 *     tags: [Sermons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do sermão
 *     responses:
 *       200:
 *         description: Detalhes do sermão
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sermon'
 *       404:
 *         description: Sermão não encontrado
 */

/**
 * @swagger
 * /api/sermons/series:
 *   get:
 *     summary: Lista todas as séries de sermões
 *     tags: [Sermons]
 *     responses:
 *       200:
 *         description: Lista de séries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */

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

/**
 * @swagger
 * /api/sermons/count:
 *   get:
 *     summary: Conta total de sermões
 *     tags: [Sermons]
 *     responses:
 *       200:
 *         description: Contagem de sermões obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 100
 */
router.get('/count', cacheMiddleware('stats'), async (req, res, next) => {
  try {
    const stats = await SermonService.getStats();
    res.json(ApiResponseDTO.success({ count: stats.totalSermons }, 'Contagem de sermões obtida com sucesso'));
  } catch (error) {
    next(error);
  }
});


/**
 * @swagger
 * /api/sermons:
 *   get:
 *     summary: Lista todos os sermões
 *     tags: [Sermons]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página da listagem
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Quantidade de itens por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca
 *     responses:
 *       200:
 *         description: Lista paginada de sermões
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sermon'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 */
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

// GET /api/sermons/suggestions - Busca sugestões de busca
router.get('/suggestions', cacheMiddleware('suggestions'), async (req, res, next) => {
  try {
    const { q: searchTerm, limit = 5 } = req.query;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.json(ApiResponseDTO.success([], 'Forneça um termo de busca com pelo menos 2 caracteres'));
    }

    const suggestions = await SermonService.findSuggestions(searchTerm, parseInt(limit));
    res.json(ApiResponseDTO.success(suggestions, 'Sugestões de busca obtidas com sucesso'));
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error);
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
      data: result.sReplacementChunksermons,
      pagination: result.pagination
    }, `Busca por '${searchTerm}' realizada com sucesso`));
  } catch (error) {
    next(error);
  }
});

// GET /api/sermons/suggestions - Busca sugestões de busca
router.get('/suggestions', cacheMiddleware('suggestions'), async (req, res, next) => {
  try {
    const { q: query, limit = 5 } = req.query;

    if (!query || query.length < 2) {
      return res.json(ApiResponseDTO.success([], 'Forneça pelo menos 2 caracteres para busca'));
    }

    const suggestions = await SermonService.findSuggestions(query, parseInt(limit));
    res.json(ApiResponseDTO.success(suggestions, 'Sugestões encontradas'));
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
// ========== AVALIAÇÃO POR ESTRELAS ==========
// POST /api/sermons/:id/rate - Avaliar ou atualizar avaliação de um sermão
router.post('/:id/rate', validateId, async (req, res, next) => {
  try {
    const { stars, deviceId } = req.body;
    
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'A avaliação deve ser entre 1 e 5 estrelas.' });
    }
    
    if (!deviceId) {
      return res.status(400).json({ message: 'ID do dispositivo não fornecido.' });
    }
    
    const sermon = await Sermon.findById(req.params.id);
    if (!sermon) return res.status(404).json({ message: 'Sermão não encontrado.' });
    
    // Verifica se o dispositivo já avaliou
    const existingRatingIndex = sermon.ratings.findIndex(r => r.deviceId === deviceId);
    
    if (existingRatingIndex >= 0) {
      // Atualiza avaliação existente
      sermon.ratings[existingRatingIndex].stars = stars;
      sermon.ratings[existingRatingIndex].updatedAt = new Date();
    } else {
      // Adiciona nova avaliação
      sermon.ratings.push({
        deviceId,
        stars,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    await sermon.save();
    
    // Calcula a nova média e total
    const total = sermon.ratings.length;
    const average = total > 0 
      ? (sermon.ratings.reduce((sum, r) => sum + r.stars, 0) / total).toFixed(1)
      : 0;
    
    res.json({ 
      message: 'Avaliação registrada com sucesso.',
      average: parseFloat(average),
      total
    });
  } catch (error) {
    console.error('Erro ao registrar avaliação:', error);
    next(error);
  }
});

// GET /api/sermons/:id/ratings - Obter média e total de avaliações
router.get('/:id/ratings', validateId, async (req, res, next) => {
  try {
    const sermon = await Sermon.findById(req.params.id);
    if (!sermon) return res.status(404).json({ message: 'Sermão não encontrado.' });
    const total = sermon.ratings.length;
    const avg = total > 0 ? (sermon.ratings.reduce((sum, r) => sum + r.stars, 0) / total).toFixed(2) : null;
    res.json({ average: avg, total });
  } catch (error) {
    next(error);
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