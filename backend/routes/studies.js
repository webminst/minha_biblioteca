// routes/studies.js
const express = require('express');
const router = express.Router();
const Study = require('../models/Study');
const StudyService = require('../services/CachedStudyService');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// Importa DTOs e middlewares de validação - NOVO
const {
  CreateStudyDTO,
  UpdateStudyDTO,
  StudyResponseDTO,
  StudySearchDTO,
  ApiResponseDTO,
  PaginationDTO
} = require('../dto');

const {
  validateInput,
  validateId,
  transformOutput,
  handleValidationErrors
} = require('../middleware/dtoValidation');

/**
 * Rotas para gerenciamento de estudos bíblicos
 * CRUD completo para estudos e materiais didáticos
 */

// ========== ROTAS PÚBLICAS ==========
// GET /api/studies/count - Conta total de estudos
router.get('/count', cacheMiddleware('stats'), async (req, res, next) => {
  try {
    const stats = await StudyService.getStats();

    res.json(
      ApiResponseDTO.success(
        { count: stats.totalStudies },
        'Contagem de estudos obtida com sucesso'
      )
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/studies - Lista todos os estudos
router.get('/', cacheMiddleware('list'), async (req, res, next) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      theme: req.query.theme,
      format: req.query.format,
      reference: req.query.reference,
      search: req.query.search
    };

    const result = await StudyService.findAll(options);

    // Cria objeto de paginação padronizado
    // Corrigido: usa o campo correto de total de itens
    const totalItems = (result.pagination && result.pagination.total) || result.total || 0;
    const pagination = new PaginationDTO({
      page: options.page,
      limit: options.limit,
      totalItems
    });
    const paginationResult = pagination.validate();
    if (!paginationResult.isValid) {
      throw new Error('Erro na paginação');
    }
    const paginationData = pagination.transform();

    // Resposta padronizada com paginação
    res.json(
      ApiResponseDTO.paginated(
        result.studies || result.data || result,
        paginationData,
        'Estudos recuperados com sucesso'
      )
    );
  } catch (error) {
    console.error('Erro na rota GET /studies:', error);
    next(error);
  }
});

// GET /api/studies/latest - Busca o estudo mais recente
router.get('/latest', cacheMiddleware('stats'), async (req, res, next) => {
  try {
    const latestStudy = await StudyService.findLatest();

    if (!latestStudy) {
      return res.status(404).json(
        ApiResponseDTO.error('Nenhum estudo encontrado', [], 404)
      );
    }

    res.json(
      ApiResponseDTO.success(latestStudy, 'Último estudo encontrado')
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/stats - Estatísticas dos estudos
router.get('/stats', cacheMiddleware('stats'), async (req, res, next) => {
  try {
    const stats = await StudyService.getStats();

    res.json(
      ApiResponseDTO.success(stats, 'Estatísticas dos estudos obtidas com sucesso')
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/themes - Lista todos os temas
router.get('/themes', cacheMiddleware('stats'), async (req, res, next) => {
  try {
    const themes = await StudyService.getAllThemes();

    res.json(
      ApiResponseDTO.success(themes, 'Temas dos estudos obtidos com sucesso')
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/formats - Lista todos os formatos
router.get('/formats', cacheMiddleware('stats'), async (req, res, next) => {
  try {
    const formats = await StudyService.getAllFormats();

    res.json(
      ApiResponseDTO.success(formats, 'Formatos dos estudos obtidos com sucesso')
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/references - Lista todas as referências bíblicas
router.get('/references', cacheMiddleware('stats'), async (req, res, next) => {
  try {
    const references = await StudyService.getAllReferences();

    res.json(
      ApiResponseDTO.success(references, 'Referências bíblicas obtidas com sucesso')
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/popular - Estudos populares
router.get('/popular', cacheMiddleware('filter'), async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;
    const studies = await StudyService.findPopular(limit);

    res.json(
      ApiResponseDTO.success(studies, 'Estudos populares obtidos com sucesso')
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/:id - Busca estudo específico por ID
router.get('/:id',
  validateId,
  cacheMiddleware('detail'),
  transformOutput(StudyResponseDTO),
  async (req, res, next) => {
    try {
      const study = await StudyService.findById(req.params.id);

      if (!study) {
        return res.status(404).json(
          ApiResponseDTO.error('Estudo não encontrado', [], 404)
        );
      }

      res.json(
        ApiResponseDTO.success(study, 'Estudo encontrado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  });

// GET /api/studies/theme/:theme - Estudos por tema específico
router.get('/theme/:theme', cacheMiddleware('filter'), async (req, res, next) => {
  try {
    const studies = await StudyService.findByTheme(req.params.theme);

    res.json(
      ApiResponseDTO.success(studies, `Estudos do tema "${req.params.theme}" obtidos com sucesso`)
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/format/:format - Estudos por formato específico
router.get('/format/:format', cacheMiddleware('filter'), async (req, res, next) => {
  try {
    const studies = await StudyService.findByFormat(req.params.format);

    res.json(
      ApiResponseDTO.success(studies, `Estudos do formato "${req.params.format}" obtidos com sucesso`)
    );
  } catch (error) {
    next(error);
  }
});

// GET /api/studies/:id/related - Estudos relacionados
router.get('/:id/related',
  validateId,
  async (req, res, next) => {
    try {
      const limit = req.query.limit || 5;
      const relatedStudies = await StudyService.findRelated(req.params.id, limit);

      res.json(
        ApiResponseDTO.success(relatedStudies, 'Estudos relacionados obtidos com sucesso')
      );
    } catch (error) {
      next(error);
    }
  });

// ========== ROTAS PROTEGIDAS (ADMIN/EDITOR) ==========
// POST /api/studies - Criar novo estudo
router.post('/',
  protect,
  authorizeRoles('admin', 'editor'),
  validateInput(CreateStudyDTO),
  transformOutput(StudyResponseDTO),
  async (req, res, next) => {
    try {
      const studyData = req.validatedInput;
      const savedStudy = await StudyService.create(studyData, req.user._id);

      res.status(201).json(
        ApiResponseDTO.success(savedStudy, 'Estudo criado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  });

// PATCH /api/studies/:id - Atualizar estudo existente
router.patch('/:id',
  protect,
  authorizeRoles('admin', 'editor'),
  validateId,
  validateInput(UpdateStudyDTO),
  transformOutput(StudyResponseDTO),
  async (req, res, next) => {
    try {
      const updateData = req.validatedInput;
      const updatedStudy = await StudyService.update(req.params.id, updateData, req.user._id);

      res.json(
        ApiResponseDTO.success(updatedStudy, 'Estudo atualizado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  });

// ========== ROTAS PROTEGIDAS (APENAS ADMIN) ==========
// DELETE /api/studies/:id - Deletar estudo
router.delete('/:id',
  protect,
  authorizeRoles('admin'),
  validateId,
  transformOutput(ApiResponseDTO),
  async (req, res, next) => {
    try {
      const result = await StudyService.delete(req.params.id);

      // Se o service já retorna uma resposta estruturada, use-a
      if (result.success !== undefined) {
        res.json(result);
      } else {
        // Caso contrário, padroniza a resposta
        res.json(
          ApiResponseDTO.success(result, 'Estudo deletado com sucesso')
        );
      }
    } catch (error) {
      next(error);
    }
  });

// ========== ROTA DE BUSCA ==========
// GET /api/studies/search/:term - Buscar estudos por termo
router.get('/search/:term',
  validateInput(StudySearchDTO, { isQuery: true }),
  cacheMiddleware('filter'),
  transformOutput(StudyResponseDTO),
  async (req, res, next) => {
    try {
      const searchTerm = req.params.term;
      const searchOptions = { ...req.validatedInput, search: searchTerm };
      const result = await StudyService.findAll(searchOptions);

      res.json(
        ApiResponseDTO.success(
          result.studies || result.data || result,
          `Busca por "${searchTerm}" realizada com sucesso`,
          null,
          { searchTerm, count: (result.studies || result.data || result).length }
        )
      );
    } catch (error) {
      next(error);
    }
  });

// Middleware de tratamento de erros específico para DTOs - NOVO
router.use(handleValidationErrors);

module.exports = router;