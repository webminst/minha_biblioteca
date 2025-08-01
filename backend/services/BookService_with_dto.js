// services/BookService_with_dto.js
/**
 * EXEMPLO DE IMPLEMENTAÇÃO: BookService com DTOs
 * Mostra como integrar DTOs na camada de serviço
 */

const Book = require('../models/Book');
const { AppError } = require('../middleware/errorHandler');
const {
  CreateBookDTO,
  UpdateBookDTO,
  BookResponseDTO,
  BookSearchDTO,
  PaginationDTO,
  StatsDTO,
} = require('../dto');

/**
 * Serviço para gerenciamento de livros com DTOs integrados
 */
class BookServiceWithDTO {

  /**
     * Busca todos os livros com validação e transformação de parâmetros
     * @param {Object} options - Opções de busca (já validadas pelo DTO)
     * @returns {Object} - Livros paginados com DTOs aplicados
     */
  async findAll(options = {}) {
    try {
      // Valida e transforma parâmetros de busca
      const searchDTO = BookSearchDTO.validateAndCreate(options);
      if (!searchDTO.success) {
        throw new AppError('Parâmetros de busca inválidos', 400, searchDTO.errors);
      }

      const searchParams = searchDTO.data;

      // Constrói filtros do MongoDB
      const filters = this._buildSearchFilters(searchParams);

      // Configuração de ordenação
      const sort = {};
      sort[searchParams.sortBy] = searchParams.sortOrder === 'desc' ? -1 : 1;

      // Calcula skip para paginação
      const skip = (searchParams.page - 1) * searchParams.limit;

      // Executa busca paginada
      const [books, totalBooks] = await Promise.all([
        Book.find(filters)
          .sort(sort)
          .skip(skip)
          .limit(searchParams.limit)
          .lean(),
        Book.countDocuments(filters),
      ]);

      // Transforma cada livro usando DTO de resposta
      const transformedBooks = books.map(book => {
        const bookDTO = new BookResponseDTO(book);
        return bookDTO.toSummaryObject(); // ou toPublicObject() para dados completos
      });

      // Cria paginação padronizada
      const pagination = PaginationDTO.fromQuery(searchParams, totalBooks);

      return {
        books: transformedBooks,
        pagination,
        totalBooks,
        filters: searchParams,
      };

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao buscar livros', 500, null, error);
    }
  }

  /**
     * Busca livro por ID com validação
     * @param {string} id - ID do livro
     * @returns {Object} - Livro transformado pelo DTO
     */
  async findById(id) {
    try {
      // Valida ID (pode ser feito no middleware também)
      const { MongoIdDTO } = require('../dto');
      const validId = MongoIdDTO.validate(id);

      const book = await Book.findById(validId).lean();
      if (!book) {
        throw new AppError('Livro não encontrado', 404);
      }

      // Incrementa visualizações
      await Book.findByIdAndUpdate(validId, { $inc: { views: 1 } });

      // Transforma usando DTO
      const bookDTO = new BookResponseDTO(book);
      return bookDTO.toPublicObject();

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao buscar livro', 500, null, error);
    }
  }

  /**
     * Cria novo livro com validação completa
     * @param {Object} bookData - Dados do livro
     * @param {string} userId - ID do usuário criador
     * @returns {Object} - Livro criado e transformado
     */
  async create(bookData, userId) {
    try {
      // Valida dados de entrada
      const createDTO = CreateBookDTO.validateAndCreate(bookData);
      if (!createDTO.success) {
        throw new AppError('Dados do livro inválidos', 400, createDTO.errors);
      }

      // Transforma dados para criação
      const transformedData = createDTO.instance.transform();

      // Adiciona metadados
      transformedData.createdBy = userId;
      transformedData.views = 0;
      transformedData.likes = 0;

      // Verifica duplicatas por título e autor
      const existingBook = await Book.findOne({
        title: transformedData.title,
        author: transformedData.author,
      });

      if (existingBook) {
        throw new AppError('Livro com este título e autor já existe', 409);
      }

      // Cria no banco
      const savedBook = await Book.create(transformedData);

      // Transforma resposta
      const responseDTO = new BookResponseDTO(savedBook.toObject());
      return responseDTO.toPublicObject();

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error.code === 11000) {
        throw new AppError('Livro duplicado', 409);
      }
      throw new AppError('Erro ao criar livro', 500, null, error);
    }
  }

  /**
     * Atualiza livro existente
     * @param {string} id - ID do livro
     * @param {Object} updateData - Dados para atualização
     * @param {string} userId - ID do usuário que está atualizando
     * @returns {Object} - Livro atualizado
     */
  async update(id, updateData, userId) {
    try {
      // Valida ID
      const { MongoIdDTO } = require('../dto');
      const validId = MongoIdDTO.validate(id);

      // Valida dados de atualização
      const updateDTO = UpdateBookDTO.validateAndCreate(updateData);
      if (!updateDTO.success) {
        throw new AppError('Dados de atualização inválidos', 400, updateDTO.errors);
      }

      const transformedData = updateDTO.instance.transform();

      // Adiciona metadados de atualização
      transformedData.updatedBy = userId;
      transformedData.updatedAt = new Date();

      // Verifica se livro existe
      const existingBook = await Book.findById(validId);
      if (!existingBook) {
        throw new AppError('Livro não encontrado', 404);
      }

      // Atualiza no banco
      const updatedBook = await Book.findByIdAndUpdate(
        validId,
        transformedData,
        { new: true, runValidators: true },
      ).lean();

      // Transforma resposta
      const responseDTO = new BookResponseDTO(updatedBook);
      return responseDTO.toPublicObject();

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao atualizar livro', 500, null, error);
    }
  }

  /**
     * Gera estatísticas com DTO
     * @returns {Object} - Estatísticas transformadas
     */
  async getStats() {
    try {
      const [
        totalBooks,
        totalViews,
        totalLikes,
        featuredBooks,
        recentBooks,
        topTags,
        monthlyStats,
      ] = await Promise.all([
        Book.countDocuments({ isPublished: true }),
        Book.aggregate([
          { $match: { isPublished: true } },
          { $group: { _id: null, total: { $sum: '$views' } } },
        ]),
        Book.aggregate([
          { $match: { isPublished: true } },
          { $group: { _id: null, total: { $sum: '$likes' } } },
        ]),
        Book.countDocuments({ featured: true, isPublished: true }),
        Book.countDocuments({
          isPublished: true,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }),
        this._getTopTags(),
        this._getMonthlyStats(),
      ]);

      // Cria DTO de estatísticas
      const statsData = {
        totalItems: totalBooks,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        featuredItems: featuredBooks,
        recentItems: recentBooks,
        topTags,
        monthlyStats,
      };

      const statsDTO = new StatsDTO(statsData);
      const validation = statsDTO.validate();

      if (!validation.isValid) {
        throw new AppError('Erro ao processar estatísticas', 500);
      }

      return statsDTO.toPublicObject();

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Erro ao gerar estatísticas', 500, null, error);
    }
  }

  /**
     * Constrói filtros de busca do MongoDB
     * @private
     */
  _buildSearchFilters(params) {
    const filters = { isPublished: true };

    if (params.author) {
      filters.author = { $regex: params.author, $options: 'i' };
    }

    if (params.area) {
      filters.area = params.area;
    }

    if (params.publisher) {
      filters.publisher = { $regex: params.publisher, $options: 'i' };
    }

    if (params.search) {
      filters.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { author: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
      ];
    }

    if (params.tags && params.tags.length > 0) {
      filters.tags = { $in: params.tags };
    }

    if (params.featured !== undefined) {
      filters.featured = params.featured;
    }

    if (params.minRating) {
      filters.personalRating = { $gte: params.minRating };
    }

    if (params.maxRating) {
      filters.personalRating = { ...filters.personalRating, $lte: params.maxRating };
    }

    if (params.fromDate || params.toDate) {
      filters.createdAt = {};
      if (params.fromDate) filters.createdAt.$gte = params.fromDate;
      if (params.toDate) filters.createdAt.$lte = params.toDate;
    }

    return filters;
  }

  /**
     * Busca top tags
     * @private
     */
  async _getTopTags() {
    const result = await Book.aggregate([
      { $match: { isPublished: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, tag: '$_id', count: 1 } },
    ]);
    return result;
  }

  /**
     * Busca estatísticas mensais
     * @private
     */
  async _getMonthlyStats() {
    const result = await Book.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $toString: '$_id.month' },
            ],
          },
          count: 1,
        },
      },
    ]);
    return result.reverse();
  }
}

module.exports = new BookServiceWithDTO();

/**
 * BENEFÍCIOS DOS DTOs NO SERVICE:
 *
 * 1. VALIDAÇÃO CONSISTENTE:
 *    - Todos os dados são validados antes do processamento
 *    - Erros padronizados e informativos
 *
 * 2. TRANSFORMAÇÃO AUTOMÁTICA:
 *    - Dados normalizados automaticamente
 *    - Formato consistente em todas as respostas
 *
 * 3. SEGURANÇA:
 *    - Campos sensíveis filtrados automaticamente
 *    - Validação robusta contra ataques de injeção
 *
 * 4. MANUTENIBILIDADE:
 *    - Mudanças de formato centralizadas nos DTOs
 *    - Código mais limpo e legível
 *
 * 5. DOCUMENTAÇÃO:
 *    - Schemas servem como documentação automática
 *    - Contratos claros entre camadas
 */
