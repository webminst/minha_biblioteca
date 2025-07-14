// routes/books.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const CachedBookService = require('../services/CachedBookService'); // NOVO: Service com cache
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// NOVO: Importa middlewares de cache
const {
  cacheStrategies,
  invalidateCacheMiddleware,
  cacheStatsMiddleware
} = require('../middleware/cacheMiddleware');

// Importa DTOs e middlewares de validação - NOVO
const {
  CreateBookDTO,
  UpdateBookDTO,
  BookResponseDTO,
  BookSearchDTO,
  ApiResponseDTO,
  PaginationDTO
} = require('../dto');

const {
  validateInput,
  transformOutput,
  validateSearch,
  validateId,
  handleValidationErrors
} = require('../middleware/dtoValidation');

/**
 * Rotas para gerenciamento de livros/resumos
 * CRUD completo para resumos de livros teológicos
 * 🚀 COM CACHE REDIS IMPLEMENTADO
 */

// NOVO: Middleware para estatísticas de cache
router.use(cacheStatsMiddleware());

// ========== ROTAS PÚBLICAS COM CACHE ==========

// GET /api/books/count - Conta total de livros (COM CACHE)
router.get('/count',
  cacheStrategies.stats(), // NOVO: Cache de estatísticas
  async (req, res, next) => {
    try {
      const stats = await CachedBookService.getStats(); // NOVO: Usa service com cache
      res.json(ApiResponseDTO.success(
        { count: stats.totalBooks },
        'Contagem de livros obtida com sucesso'
      ));
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/books - Lista todos os livros (COM CACHE)
router.get('/',
  validateSearch(BookSearchDTO), // Valida parâmetros de busca
  cacheStrategies.contentList('books'), // NOVO: Cache para lista
  async (req, res, next) => {
    try {
      // Usa dados validados e service com cache
      const options = req.validatedData;
      const result = await CachedBookService.findAll(options); // NOVO: Service com cache

      // NOVO: Cria paginação padronizada (corrigido)
      const pagination = new PaginationDTO({
        page: options.page,
        limit: options.limit,
        totalItems: result.totalBooks || 0
      });

      const paginationResult = pagination.validate();
      if (!paginationResult.isValid) {
        throw new Error('Erro na paginação');
      }

      const paginationData = pagination.transform();

      // NOVO: Resposta padronizada com paginação
      res.json(ApiResponseDTO.paginated(
        result.books,
        paginationData,
        'Livros recuperados com sucesso'
      ));
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/books/latest - Busca o livro mais recente (COM CACHE)
// ⚠️ IMPORTANTE: Esta rota DEVE vir ANTES de /:id
router.get('/latest',
  cacheStrategies.home(), // NOVO: Cache para dados da home
  async (req, res, next) => {
    try {
      const latestBook = await CachedBookService.findLatest(); // NOVO: Service com cache

      if (!latestBook) {
        return res.status(404).json(
          ApiResponseDTO.error('Nenhum livro encontrado', [], 404)
        );
      }

      res.json(
        ApiResponseDTO.success(latestBook, 'Último livro encontrado')
      );
    } catch (error) {
      next(error);
    }
  });

// GET /api/books/search/:term - Buscar livros por termo (COM CACHE)
// ⚠️ IMPORTANTE: Rotas específicas devem vir ANTES de /:id
router.get('/search/:term',
  cacheStrategies.search('books'), // NOVO: Cache para busca
  async (req, res, next) => {
    try {
      const searchTerm = req.params.term;
      const result = await CachedBookService.findAll({ search: searchTerm }); // NOVO: Service com cache

      res.json({
        searchTerm,
        count: result.books.length,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/books/stats - Estatísticas dos livros (COM CACHE)
router.get('/stats',
  cacheStrategies.stats(), // NOVO: Cache para estatísticas
  async (req, res, next) => {
    try {
      const stats = await CachedBookService.getStats(); // NOVO: Service com cache
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/books/authors - Lista todos os autores (COM CACHE)
router.get('/authors',
  cacheStrategies.filters('books'), // NOVO: Cache para filtros
  async (req, res, next) => {
    try {
      const authors = await CachedBookService.getUniqueAuthors(); // NOVO: Service com cache
      res.json(authors);
    } catch (error) {
      next(error);
    }
  });

// GET /api/books/areas - Lista todas as áreas (COM CACHE)
router.get('/areas',
  cacheStrategies.filters('books'), // NOVO: Cache para filtros
  async (req, res, next) => {
    try {
      const areas = await CachedBookService.getUniqueAreas(); // NOVO: Service com cache
      res.json(areas);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/books/publishers - Lista todas as editoras (COM CACHE)
router.get('/publishers',
  cacheStrategies.filters('books'), // NOVO: Cache para filtros
  async (req, res, next) => {
    try {
      const publishers = await CachedBookService.getUniquePublishers(); // NOVO: Service com cache
      res.json(publishers);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/books/series - Lista todas as séries (COM CACHE)
router.get('/series',
  cacheStrategies.filters('books'), // NOVO: Cache para filtros
  async (req, res, next) => {
    try {
      const series = await CachedBookService.getAllSeries(); // NOVO: Service com cache
      res.json(series);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/books/popular - Livros populares (COM CACHE)
router.get('/popular',
  cacheStrategies.contentList('books'), // NOVO: Cache para lista
  async (req, res, next) => {
    try {
      const limit = req.query.limit || 10;
      const books = await CachedBookService.findPopular(limit); // NOVO: Service com cache
      res.json(books);
    } catch (error) {
      next(error);
    }
  });

// GET /api/books/author/:name - Livros por autor específico (COM CACHE)
router.get('/author/:name',
  cacheStrategies.contentList('books'), // NOVO: Cache para lista filtrada
  async (req, res, next) => {
    try {
      const books = await CachedBookService.findByAuthor(req.params.name); // NOVO: Service com cache
      res.json(books);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/books/area/:area - Livros por área específica (COM CACHE)
router.get('/area/:area',
  cacheStrategies.contentList('books'), // NOVO: Cache para lista filtrada
  async (req, res, next) => {
    try {
      const books = await CachedBookService.findByArea(req.params.area); // NOVO: Service com cache
      res.json(books);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/books/:id/related - Livros relacionados (COM CACHE)
router.get('/:id/related',
  cacheStrategies.contentList('books'), // NOVO: Cache para lista relacionada
  async (req, res, next) => {
    try {
      const limit = req.query.limit || 5;
      const relatedBooks = await CachedBookService.findRelated(req.params.id, limit); // NOVO: Service com cache
      res.json(relatedBooks);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/books/:id - Busca livro específico por ID (COM CACHE)
// ⚠️ Esta rota deve vir POR ÚLTIMO entre as rotas GET
router.get('/:id',
  validateId, // Valida formato do ID
  cacheStrategies.contentDetail('books'), // NOVO: Cache para detalhes
  transformOutput(BookResponseDTO, 'toPublicObject'), // Transforma saída
  async (req, res, next) => {
    try {
      // Usa ID validado e service com cache
      const book = await CachedBookService.findById(req.validatedId); // NOVO: Service com cache

      // Resposta padronizada
      res.json(ApiResponseDTO.success(
        book,
        'Livro encontrado com sucesso'
      ));
    } catch (error) {
      next(error);
    }
  }
);

// ========== ROTAS PROTEGIDAS (ADMIN) COM INVALIDAÇÃO DE CACHE ==========

// POST /api/books - Criar novo livro (COM INVALIDAÇÃO DE CACHE)
router.post('/',
  protect,
  authorizeRoles('admin', 'editor'),
  validateInput(CreateBookDTO), // Valida dados de entrada
  transformOutput(BookResponseDTO, 'toPublicObject'), // Transforma saída
  invalidateCacheMiddleware('books', 'create'), // NOVO: Invalida cache após criação
  async (req, res, next) => {
    try {
      // Usa dados validados do middleware e service com cache
      const savedBook = await CachedBookService.create(req.validatedData, req.user._id); // NOVO: Service com cache

      // Resposta padronizada
      res.status(201).json(ApiResponseDTO.success(
        savedBook,
        'Livro criado com sucesso'
      ));
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/books/:id - Atualizar livro existente (COM INVALIDAÇÃO DE CACHE)
router.put('/:id',
  protect,
  authorizeRoles('admin', 'editor'),
  validateId,
  validateInput(UpdateBookDTO),
  transformOutput(BookResponseDTO),
  invalidateCacheMiddleware('books', 'update'), // NOVO: Invalida cache após atualização
  async (req, res, next) => {
    try {
      const updateData = req.validatedInput;
      const updatedBook = await CachedBookService.update(req.params.id, updateData, req.user._id); // NOVO: Service com cache

      res.json(
        ApiResponseDTO.success('Livro atualizado com sucesso', updatedBook)
      );
    } catch (error) {
      next(error);
    }
  });

// DELETE /api/books/:id - Deletar livro (COM INVALIDAÇÃO DE CACHE)
router.delete('/:id',
  protect,
  authorizeRoles('admin'),
  validateId,
  transformOutput(ApiResponseDTO),
  invalidateCacheMiddleware('books', 'delete'), // NOVO: Invalida cache após exclusão
  async (req, res, next) => {
    try {
      const result = await CachedBookService.delete(req.params.id); // NOVO: Service com cache

      // Se o service já retorna uma resposta estruturada, use-a
      if (result.success !== undefined) {
        res.json(result);
      } else {
        // Caso contrário, padroniza a resposta
        res.json(
          ApiResponseDTO.success('Livro deletado com sucesso', result)
        );
      }
    } catch (error) {
      next(error);
    }
  });

// NOVO: Rota para estatísticas de cache (apenas para admins)
router.get('/admin/cache-stats',
  protect,
  authorizeRoles('admin'),
  async (req, res, next) => {
    try {
      const stats = await CachedBookService.getCacheStatus();
      res.json(ApiResponseDTO.success(stats, 'Estatísticas de cache obtidas'));
    } catch (error) {
      next(error);
    }
  }
);

// Middleware de tratamento de erros específico para DTOs - NOVO
router.use(handleValidationErrors);

module.exports = router;