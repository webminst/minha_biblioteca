// routes/books.js
const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const BookService = require('../services/BookService');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

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
 */

// ========== ROTAS PÚBLICAS ==========
// GET /api/books/count - Conta total de livros (MIGRADO)
router.get('/count', async (req, res, next) => {
  try {
    const stats = await BookService.getStats();
    res.json(ApiResponseDTO.success(
      { count: stats.totalBooks },
      'Contagem de livros obtida com sucesso'
    ));
  } catch (error) {
    next(error);
  }
});

// GET /api/books - Lista todos os livros (MIGRADO)
router.get('/',
  validateSearch(BookSearchDTO), // NOVO: Valida parâmetros de busca
  async (req, res, next) => {
    try {
      // NOVO: Usa dados validados
      const options = req.validatedData;
      const result = await BookService.findAll(options);

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

// GET /api/books/latest - Busca o livro mais recente
// ⚠️ IMPORTANTE: Esta rota DEVE vir ANTES de /:id
router.get('/latest', async (req, res, next) => {
  try {
    const latestBook = await BookService.findLatest();

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

// GET /api/books/search/:term - Buscar livros por termo
// ⚠️ IMPORTANTE: Rotas específicas devem vir ANTES de /:id
router.get('/search/:term', async (req, res, next) => {
  try {
    const searchTerm = req.params.term;
    const result = await BookService.findAll({ search: searchTerm });

    res.json({
      searchTerm,
      count: result.books.length,
      ...result
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

// GET /api/books/:id - Busca livro específico por ID (MIGRADO)
// ⚠️ Esta rota deve vir POR ÚLTIMO entre as rotas GET
router.get('/:id',
  validateId, // NOVO: Valida formato do ID
  transformOutput(BookResponseDTO, 'toPublicObject'), // NOVO: Transforma saída
  async (req, res, next) => {
    try {
      // NOVO: Usa ID validado
      const book = await BookService.findById(req.validatedId);

      // NOVO: Resposta padronizada
      res.json(ApiResponseDTO.success(
        book,
        'Livro encontrado com sucesso'
      ));
    } catch (error) {
      next(error);
    }
  }
);

// ========== ROTAS PROTEGIDAS (ADMIN) ==========
// POST /api/books - Criar novo livro (MIGRADO PARA DTOs)
router.post('/',
  protect,
  authorizeRoles('admin', 'editor'),
  validateInput(CreateBookDTO), // NOVO: Valida dados de entrada
  transformOutput(BookResponseDTO, 'toPublicObject'), // NOVO: Transforma saída
  async (req, res, next) => {
    try {
      // NOVO: Usa dados validados do middleware
      const savedBook = await BookService.create(req.validatedData, req.user._id);

      // NOVO: Resposta padronizada
      res.status(201).json(ApiResponseDTO.success(
        savedBook,
        'Livro criado com sucesso'
      ));
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/books/:id - Atualizar livro existente
router.put('/:id',
  protect,
  authorizeRoles('admin', 'editor'),
  validateId,
  validateInput(UpdateBookDTO),
  transformOutput(BookResponseDTO),
  async (req, res, next) => {
    try {
      const updateData = req.validatedInput;
      const updatedBook = await BookService.update(req.params.id, updateData, req.user._id);

      res.json(
        ApiResponseDTO.success('Livro atualizado com sucesso', updatedBook)
      );
    } catch (error) {
      next(error);
    }
  });

// DELETE /api/books/:id - Deletar livro
router.delete('/:id',
  protect,
  authorizeRoles('admin'),
  validateId,
  transformOutput(ApiResponseDTO),
  async (req, res, next) => {
    try {
      const result = await BookService.delete(req.params.id);

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

// Middleware de tratamento de erros específico para DTOs - NOVO
router.use(handleValidationErrors);

module.exports = router;