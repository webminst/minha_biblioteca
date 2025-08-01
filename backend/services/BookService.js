// backend/services/BookService.js
const Book = require('../models/Book');
const { AppError } = require('../middleware/errorHandler');

/**
 * Serviço para gerenciamento de livros e resumos
 * Centraliza toda a lógica de negócio relacionada aos livros
 */
class BookService {

  /**
     * Busca todos os livros com paginação e filtros
     * @param {Object} options - Opções de busca
     * @returns {Object} - Livros paginados
     */
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      author,
      area,
      publisher,
      series,
      search,
    } = options;

    // Constrói filtros
    const filters = {};
    if (author) filters.author = { $regex: author, $options: 'i' };
    if (area) filters.area = { $regex: area, $options: 'i' };
    if (publisher) filters.publisher = { $regex: publisher, $options: 'i' };
    if (series) filters.series = { $regex: series, $options: 'i' };

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { publisher: { $regex: search, $options: 'i' } },
      ];
    }

    // Configuração de ordenação
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Executa busca paginada
    const skip = (page - 1) * limit;

    const [books, total] = await Promise.all([
      Book.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .select('title author publisher area description tags coverImageUrl createdAt updatedAt'),
      Book.countDocuments(filters),
    ]);

    return {
      books,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      filters: {
        author,
        area,
        publisher,
        series,
        search,
      },
    };
  }

  /**
     * Busca livro por ID
     * @param {string} id - ID do livro
     * @returns {Object} - Livro encontrado
     */
  async findById(id) {
    const book = await Book.findById(id);

    if (!book) {
      throw new AppError('Livro não encontrado', 404);
    }

    return book;
  }

  /**
     * Busca o último livro criado
     * @returns {Object} - Último livro
     */
  async findLatest() {
    const book = await Book.findOne()
      .sort({ createdAt: -1 })
      .select('title author publisher area description');

    if (!book) {
      throw new AppError('Nenhum livro encontrado', 404);
    }

    return book;
  }

  /**
     * Cria novo livro
     * @param {Object} bookData - Dados do livro
     * @param {string} userId - ID do usuário que está criando
     * @returns {Object} - Livro criado
     */
  async create(bookData, userId) {
    // Validações de negócio
    if (!bookData.title) {
      throw new AppError('Título é obrigatório', 400);
    }

    // Verifica se já existe livro com mesmo título e autor
    if (bookData.author) {
      const existingBook = await Book.findOne({
        title: bookData.title,
        author: bookData.author,
      });

      if (existingBook) {
        throw new AppError('Já existe um livro com este título e autor', 409);
      }
    } else {
      // Se não tem autor, verifica apenas por título
      const existingBook = await Book.findOne({
        title: bookData.title,
      });

      if (existingBook) {
        throw new AppError('Já existe um livro com este título', 409);
      }
    }

    // Mapeia o campo 'summary' para 'content' se existir
    const bookDataMapped = { ...bookData };
    if ('summary' in bookDataMapped) {
      bookDataMapped.content = bookDataMapped.summary;
      delete bookDataMapped.summary;
    }

    const book = new Book({
      ...bookDataMapped,
      createdBy: userId,
    });

    const savedBook = await book.save();
    return savedBook;
  }

  /**
     * Atualiza livro existente
     * @param {string} id - ID do livro
     * @param {Object} updateData - Dados para atualização
     * @param {string} userId - ID do usuário que está atualizando
     * @returns {Object} - Livro atualizado
     */
  async update(id, updateData, userId) {

    // LOG: Dados recebidos para update
    console.log('[BookService.update] id:', id);
    console.log('[BookService.update] updateData recebido:', JSON.stringify(updateData, null, 2));
    console.log('[BookService.update] userId:', userId);

    const book = await Book.findById(id);
    if (!book) {
      console.error('[BookService.update] Livro não encontrado:', id);
      throw new AppError('Livro não encontrado', 404);
    }

    // Garante que summary e content sempre estejam juntos
    const updateDataMapped = { ...updateData };
    if ('summary' in updateDataMapped && !('content' in updateDataMapped)) {
      updateDataMapped.content = updateDataMapped.summary;
    }
    if ('content' in updateDataMapped && !('summary' in updateDataMapped)) {
      updateDataMapped.summary = updateDataMapped.content;
    }


    // Remove campos nulos/undefined
    Object.keys(updateDataMapped).forEach(key => {
      if (updateDataMapped[key] === undefined) {
        delete updateDataMapped[key];
      }
    });

    // LOG: Dados mapeados para update
    console.log('[BookService.update] updateDataMapped:', JSON.stringify(updateDataMapped, null, 2));

    // Garante que há pelo menos um campo para atualizar (além de updatedBy/updatedAt)
    const updateKeys = Object.keys(updateDataMapped).filter(k => !['updatedBy', 'updatedAt'].includes(k));
    if (updateKeys.length === 0) {
      console.error('[BookService.update] Nenhum campo válido para atualizar. updateDataMapped:', updateDataMapped);
      throw new AppError('Nenhum campo válido para atualizar.', 400);
    }

    // Se fornecido título e autor, verifica duplicação
    if (updateDataMapped.title) {
      const query = { _id: { $ne: id }, title: updateDataMapped.title };

      // Se tem autor, inclui na verificação
      if (updateDataMapped.author) {
        query.author = updateDataMapped.author;
      }

      const existingBook = await Book.findOne(query);

      if (existingBook) {
        const errorMsg = updateDataMapped.author
          ? 'Já existe outro livro com este título e autor'
          : 'Já existe outro livro com este título';
        console.error('[BookService.update] Duplicidade:', errorMsg);
        throw new AppError(errorMsg, 409);
      }
    }

    try {
      const updatedBook = await Book.findByIdAndUpdate(
        id,
        {
          ...updateDataMapped,
          updatedBy: userId,
          updatedAt: new Date(),
        },
        {
          new: true,
          runValidators: true,
          context: 'query',
        },
      );

      // LOG: Resultado do update
      console.log('[BookService.update] updatedBook:', updatedBook);

      if (!updatedBook) {
        console.error('[BookService.update] Falha ao atualizar: livro não encontrado após update', id);
        throw new AppError('Falha ao atualizar o livro: livro não encontrado após a atualização', 500);
      }

      return updatedBook;
    } catch (error) {
      console.error('Erro ao atualizar livro:', error);

      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        throw new AppError(`Erro de validação: ${errors.join(', ')}`, 400);
      } else if (error.name === 'CastError') {
        throw new AppError('ID do livro inválido', 400);
      } else if (error.name === 'MongoError' && error.code === 11000) {
        throw new AppError('Já existe um livro com este título e/ou autor', 409);
      }

      throw new AppError(`Erro ao atualizar o livro: ${error.message}`, 500);
    }
  }

  /**
     * Busca livros por autor
     * @param {string} author - Nome do autor
     * @returns {Array} - Livros do autor
     */
  async findByAuthor(author) {
    const books = await Book.find({ author: { $regex: author, $options: 'i' } })
      .sort({ createdAt: -1 });
    return books;
  }

  /**
     * Busca livros por área
     * @param {string} area - Área de conhecimento
     * @returns {Array} - Livros da área
     */
  async findByArea(area) {
    const books = await Book.find({ area: { $regex: area, $options: 'i' } })
      .sort({ createdAt: -1 });
    return books;
  }

  /**
     * Busca livros por editora
     * @param {string} publisher - Nome da editora
     * @returns {Array} - Livros da editora
     */
  async findByPublisher(publisher) {
    const books = await Book.find({ publisher: { $regex: publisher, $options: 'i' } })
      .sort({ createdAt: -1 });
    return books;
  }

  /**
     * Busca livros por série
     * @param {string} series - Nome da série
     * @returns {Array} - Livros da série
     */
  async findBySeries(series) {
    const books = await Book.find({ series: { $regex: series, $options: 'i' } })
      .sort({ createdAt: -1 });
    return books;
  }

  /**
     * Busca estatísticas dos livros
     * @returns {Object} - Estatísticas
     */
  async getStats() {
    const stats = await Book.aggregate([
      {
        $group: {
          _id: null,
          totalBooks: { $sum: 1 },
          totalAuthors: { $addToSet: '$author' },
          totalAreas: { $addToSet: '$area' },
          totalPublishers: { $addToSet: '$publisher' },
          totalSeries: { $addToSet: '$series' },
          avgDescriptionLength: { $avg: { $strLenCP: '$description' } },
          mostRecentDate: { $max: '$createdAt' },
          oldestDate: { $min: '$createdAt' },
          booksWithImages: {
            $sum: {
              $cond: [{ $ne: ['$coverImageUrl', null] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalBooks: 1,
          totalAuthors: {
            $size: {
              $filter: {
                input: '$totalAuthors',
                cond: { $ne: ['$$this', null] },
              },
            },
          },
          totalAreas: {
            $size: {
              $filter: {
                input: '$totalAreas',
                cond: { $ne: ['$$this', null] },
              },
            },
          },
          totalPublishers: {
            $size: {
              $filter: {
                input: '$totalPublishers',
                cond: { $ne: ['$$this', null] },
              },
            },
          },
          totalSeries: {
            $size: {
              $filter: {
                input: '$totalSeries',
                cond: { $ne: ['$$this', null] },
              },
            },
          },
          avgDescriptionLength: { $round: ['$avgDescriptionLength', 0] },
          mostRecentDate: 1,
          oldestDate: 1,
          booksWithImages: 1,
          imagePercentage: {
            $round: [{ $multiply: [{ $divide: ['$booksWithImages', '$totalBooks'] }, 100] }, 1],
          },
        },
      },
    ]);

    return stats[0] || {
      totalBooks: 0,
      totalAuthors: 0,
      totalAreas: 0,
      totalPublishers: 0,
      totalSeries: 0,
      avgDescriptionLength: 0,
      mostRecentDate: null,
      oldestDate: null,
      booksWithImages: 0,
      imagePercentage: 0,
    };
  }

  /**
     * Busca todos os autores únicos
     * @returns {Array} - Lista de autores
     */
  async getAllAuthors() {
    const authors = await Book.distinct('author');
    return authors.filter(a => a && a.trim() !== '');
  }

  /**
     * Busca todas as áreas únicas
     * @returns {Array} - Lista de áreas
     */
  async getAllAreas() {
    const areas = await Book.distinct('area');
    return areas.filter(a => a && a.trim() !== '');
  }

  /**
     * Busca todas as editoras únicas
     * @returns {Array} - Lista de editoras
     */
  async getAllPublishers() {
    const publishers = await Book.distinct('publisher');
    return publishers.filter(p => p && p.trim() !== '');
  }

  /**
     * Busca todas as séries únicas
     * @returns {Array} - Lista de séries
     */
  async getAllSeries() {
    const series = await Book.distinct('series');
    return series.filter(s => s && s.trim() !== '');
  }

  /**
     * Busca sugestões de livros com base em um termo de busca
     * @param {string} term - Termo de busca
     * @param {number} limit - Limite de sugestões por categoria
     * @returns {Object} - Objeto com sugestões agrupadas por categoria
     */
  async findSuggestions(term, limit = 5) {
    if (!term || term.trim().length < 2) {
      return {
        titles: [],
        authors: [],
        areas: [],
        publishers: [],
      };
    }

    const searchRegex = new RegExp(term, 'i');

    try {
      // Busca paralela por diferentes categorias
      const [titles, authors, areas, publishers] = await Promise.all([
        // Títulos
        Book.find({
          title: searchRegex,
        })
          .select('title')
          .limit(limit)
          .distinct('title'),

        // Autores
        Book.find({
          author: searchRegex,
        })
          .select('author')
          .limit(limit)
          .distinct('author'),

        // Áreas
        Book.find({
          area: searchRegex,
        })
          .select('area')
          .limit(limit)
          .distinct('area'),

        // Editoras
        Book.find({
          publisher: searchRegex,
        })
          .select('publisher')
          .limit(limit)
          .distinct('publisher'),
      ]);

      // Filtra resultados nulos/vazios e limita o número de sugestões
      const filteredTitles = titles.filter(item => item && item.trim() !== '').slice(0, limit);
      const filteredAuthors = authors.filter(item => item && item.trim() !== '').slice(0, limit);
      const filteredAreas = areas.filter(item => item && item.trim() !== '').slice(0, limit);
      const filteredPublishers = publishers.filter(item => item && item.trim() !== '').slice(0, limit);

      return {
        titles: filteredTitles,
        authors: filteredAuthors,
        areas: filteredAreas,
        publishers: filteredPublishers,
      };
    } catch (error) {
      console.error('Erro ao buscar sugestões de livros:', error);
      return {
        titles: [],
        authors: [],
        areas: [],
        publishers: [],
      };
    }
  }

  /**
     * Busca livros relacionados por área, autor ou tags
     * @param {string} bookId - ID do livro atual
     * @param {number} limit - Limite de resultados
     * @returns {Array} - Livros relacionados
     */
  async findRelated(bookId, limit = 5) {
    const currentBook = await this.findById(bookId);

    const relatedBooks = await Book.find({
      _id: { $ne: bookId },
      $or: [
        { area: currentBook.area },
        { author: currentBook.author },
        { tags: { $in: currentBook.tags || [] } },
        { series: currentBook.series },
      ],
    })
      .limit(limit)
      .select('title author area description coverImageUrl')
      .sort({ createdAt: -1 });

    return relatedBooks;
  }

  /**
     * Busca livros mais populares (com base em algum critério)
     * Por enquanto usa data de criação, mas pode ser expandido para incluir views, likes, etc.
     * @param {number} limit - Limite de resultados
     * @returns {Array} - Livros populares
     */
  async findPopular(limit = 10) {
    const popularBooks = await Book.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title author area description coverImageUrl tags');

    return popularBooks;
  }

  /**
     * Exclui um livro pelo ID
     * @param {string} id - ID do livro a ser excluído
     * @returns {Object} - Objeto com informações sobre a exclusão
     */
  async delete(id) {
    try {
      const book = await Book.findByIdAndDelete(id);

      if (!book) {
        throw new AppError('Livro não encontrado', 404);
      }

      return {
        success: true,
        message: 'Livro excluído com sucesso',
        data: {
          id: book._id,
          title: book.title,
          author: book.author,
        },
      };
    } catch (error) {
      console.error('Erro ao excluir livro:', error);

      if (error.name === 'CastError') {
        throw new AppError('ID do livro inválido', 400);
      }

      throw new AppError(`Erro ao excluir o livro: ${error.message}`, 500);
    }
  }

  /**
     * Busca livros recomendados por área
     * @param {string} area - Área de interesse
     * @param {number} limit - Limite de resultados
     * @returns {Array} - Livros recomendados
     */
  async findRecommendedByArea(area, limit = 5) {
    const recommended = await Book.find({
      area: { $regex: area, $options: 'i' },
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('title author area description coverImageUrl');

    return recommended;
  }
}

module.exports = BookService;
