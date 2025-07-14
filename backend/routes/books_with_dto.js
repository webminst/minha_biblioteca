// routes/books_with_dto.js
/**
 * EXEMPLO DE IMPLEMENTAÇÃO: Rotas de Books com DTOs
 * Este arquivo mostra como suas rotas existentes podem ser atualizadas com DTOs
 */

const express = require('express');
const router = express.Router();
const BookService = require('../services/BookService');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Importa DTOs e middlewares de validação
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
    successResponse,
    handleValidationErrors
} = require('../middleware/dtoValidation');

/**
 * EXEMPLO: Rotas com DTOs implementados
 */

// ========== ROTAS PÚBLICAS ==========

// GET /api/books/count - Conta total de livros
router.get('/count',
    successResponse('Contagem obtida com sucesso'),
    async (req, res, next) => {
        try {
            const stats = await BookService.getStats();
            res.json({ count: stats.totalBooks });
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/books - Lista todos os livros com validação de parâmetros
router.get('/',
    validateSearch(BookSearchDTO), // Valida parâmetros de busca
    transformOutput(BookResponseDTO, 'toSummaryObject'), // Transforma saída para formato resumido
    async (req, res, next) => {
        try {
            // Usa dados validados do middleware
            const options = req.validatedData;
            const result = await BookService.findAll(options);

            // Cria paginação padronizada
            const pagination = PaginationDTO.fromQuery(req.query, result.totalBooks);

            res.json(ApiResponseDTO.paginated(
                result.books,
                pagination,
                'Livros recuperados com sucesso'
            ));
        } catch (error) {
            next(error);
        }
    }
);

// GET /api/books/:id - Busca livro específico por ID
router.get('/:id',
    validateId, // Valida formato do ID
    transformOutput(BookResponseDTO, 'toPublicObject'), // Transforma para formato público completo
    async (req, res, next) => {
        try {
            const book = await BookService.findById(req.validatedId);
            res.json(ApiResponseDTO.success(book, 'Livro encontrado com sucesso'));
        } catch (error) {
            next(error);
        }
    }
);

// ========== ROTAS PROTEGIDAS (ADMIN) ==========

// POST /api/books - Criar novo livro
router.post('/',
    protect,
    authorizeRoles('admin', 'editor'),
    validateInput(CreateBookDTO), // Valida dados de entrada
    transformOutput(BookResponseDTO, 'toPublicObject'), // Transforma saída
    async (req, res, next) => {
        try {
            // Usa dados validados e transformados do middleware
            const bookData = req.validatedData;
            const savedBook = await BookService.create(bookData, req.user._id);

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
    validateId, // Valida ID do parâmetro
    validateInput(UpdateBookDTO), // Valida dados de atualização
    transformOutput(BookResponseDTO, 'toPublicObject'),
    async (req, res, next) => {
        try {
            const updatedBook = await BookService.update(
                req.validatedId,
                req.validatedData,
                req.user._id
            );

            res.json(ApiResponseDTO.success(
                updatedBook,
                'Livro atualizado com sucesso'
            ));
        } catch (error) {
            next(error);
        }
    }
);

// DELETE /api/books/:id - Deletar livro
router.delete('/:id',
    protect,
    authorizeRoles('admin'),
    validateId,
    successResponse('Livro deletado com sucesso'),
    async (req, res, next) => {
        try {
            const result = await BookService.delete(req.validatedId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

// Middleware de tratamento de erros específico para DTOs
router.use(handleValidationErrors);

module.exports = router;

/**
 * COMPARAÇÃO: ANTES vs DEPOIS
 * 
 * ANTES (sem DTOs):
 * - Validação manual ou ausente
 * - Dados não transformados/padronizados
 * - Respostas inconsistentes
 * - Código repetitivo de validação
 * 
 * DEPOIS (com DTOs):
 * - Validação automática e robusta
 * - Transformação padronizada de dados
 * - Respostas consistentes
 * - Código limpo e reutilizável
 * - Melhor segurança (filtros de campos sensíveis)
 * - Documentação automática via schemas
 */
