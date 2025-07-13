// Exemplo de integração dos Services com as rotas existentes

/* ========================================
   ANTES - Rota direta com modelo
   ======================================== */

// ❌ ANTIGO: backend/routes/books.js
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ========================================
   DEPOIS - Rota usando Service
   ======================================== */

// ✅ NOVO: backend/routes/books.js
const BookService = require('../services/BookService');

router.get('/', async (req, res, next) => {
  try {
    const options = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      author: req.query.author,
      area: req.query.area,
      publisher: req.query.publisher,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder
    };

    const result = await BookService.findAll(options);
    res.json(result);
  } catch (error) {
    next(error); // Middleware de erro global trata
  }
});

/* ========================================
   EXEMPLO COMPLETO DE ROTA BOOKS
   ======================================== */

const express = require('express');
const router = express.Router();
const BookService = require('../services/BookService');
const { authenticateToken } = require('../middleware/authMiddleware');

// GET /api/books - Lista todos os livros com paginação e filtros
router.get('/', async (req, res, next) => {
  try {
    const result = await BookService.findAll(req.query);
    res.json(result);
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

// GET /api/books/latest - Último livro adicionado
router.get('/latest', async (req, res, next) => {
  try {
    const book = await BookService.findLatest();
    res.json(book);
  } catch (error) {
    next(error);
  }
});

// GET /api/books/:id - Busca livro por ID
router.get('/:id', async (req, res, next) => {
  try {
    const book = await BookService.findById(req.params.id);
    res.json(book);
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

// POST /api/books - Cria novo livro (protegido)
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const book = await BookService.create(req.body, req.user.id);
    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
});

// PUT /api/books/:id - Atualiza livro (protegido)
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const book = await BookService.update(req.params.id, req.body, req.user.id);
    res.json(book);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/books/:id - Exclui livro (protegido)
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const result = await BookService.delete(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

/* ========================================
   VANTAGENS DA ARQUITETURA COM SERVICES
   ======================================== */

/*
✅ BENEFÍCIOS IMPLEMENTADOS:

1. **Separação de Responsabilidades**
   - Rotas apenas lidam com HTTP
   - Services contêm lógica de negócio
   - Models apenas definem estrutura

2. **Reutilização de Código**
   - Lógica pode ser usada em múltiplas rotas
   - Facilita testes unitários
   - Evita duplicação de código

3. **Manutenibilidade**
   - Mudanças de regra em um local
   - Código mais organizado e limpo
   - Fácil para novos desenvolvedores

4. **Tratamento de Erros Consistente**
   - AppError personalizada
   - Middleware global de erros
   - Mensagens padronizadas

5. **Validações Centralizadas**
   - Validações de negócio no service
   - Verificação de duplicatas
   - Regras de integridade

6. **Performance Otimizada**
   - Queries MongoDB otimizadas
   - Paginação eficiente
   - Seleção de campos específicos

7. **Funcionalidades Avançadas**
   - Sistema de busca inteligente
   - Estatísticas e analytics
   - Recomendações automáticas
*/
