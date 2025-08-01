const BaseRepository = require('./BaseRepository');
const Sermon = require('../models/Sermon');

/**
 * SermonRepository - Repository específico para operações com Sermões
 * Estende BaseRepository e adiciona métodos específicos para sermões
 */
class SermonRepository extends BaseRepository {
  constructor() {
    super(Sermon);
  }

  /**
   * Busca sermões com filtros específicos
   * @param {Object} filters - Filtros de busca
   * @param {Object} options - Opções de busca
   * @returns {Promise<Object>} - Sermões com paginação
   */
  async findSermons(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      book,
      series,
      speaker,
      search
    } = options;

    // Construir filtros
    const queryFilters = { ...filters };
    
    if (book) {
      queryFilters.book = { $regex: book, $options: 'i' };
    }
    
    if (series) {
      queryFilters.series = { $regex: series, $options: 'i' };
    }
    
    if (speaker) {
      queryFilters.speaker = { $regex: speaker, $options: 'i' };
    }
    
    if (search) {
      queryFilters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { book: { $regex: search, $options: 'i' } },
        { series: { $regex: search, $options: 'i' } },
        { speaker: { $regex: search, $options: 'i' } }
      ];
    }

    // Configurar ordenação
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    return await this.findAll(queryFilters, {
      page,
      limit,
      sort,
      select: '-__v'
    });
  }

  /**
   * Busca o sermão mais recente
   * @returns {Promise<Object|null>} - Sermão mais recente
   */
  async findLatest() {
    try {
      return await this.model.findOne()
        .sort({ createdAt: -1 })
        .select('-__v')
        .exec();
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar sermão mais recente');
    }
  }

  /**
   * Busca sermões por série
   * @param {string} series - Nome da série
   * @param {Object} options - Opções de busca
   * @returns {Promise<Object>} - Sermões da série
   */
  async findBySeries(series, options = {}) {
    const filters = { series: { $regex: series, $options: 'i' } };
    return await this.findSermons(filters, options);
  }

  /**
   * Busca sermões por pregador
   * @param {string} speaker - Nome do pregador
   * @param {Object} options - Opções de busca
   * @returns {Promise<Object>} - Sermões do pregador
   */
  async findBySpeaker(speaker, options = {}) {
    const filters = { speaker: { $regex: speaker, $options: 'i' } };
    return await this.findSermons(filters, options);
  }

  /**
   * Busca sermões por livro bíblico
   * @param {string} book - Nome do livro
   * @param {Object} options - Opções de busca
   * @returns {Promise<Object>} - Sermões do livro
   */
  async findByBook(book, options = {}) {
    const filters = { book: { $regex: book, $options: 'i' } };
    return await this.findSermons(filters, options);
  }

  /**
   * Busca sugestões de busca
   * @param {string} term - Termo de busca
   * @param {number} limit - Limite de sugestões
   * @returns {Promise<Array>} - Sugestões
   */
  async findSuggestions(term, limit = 5) {
    try {
      if (!term || term.length < 2) {
        return [];
      }

      const suggestions = await this.model.aggregate([
        {
          $match: {
            $or: [
              { title: { $regex: term, $options: 'i' } },
              { book: { $regex: term, $options: 'i' } },
              { series: { $regex: term, $options: 'i' } },
              { speaker: { $regex: term, $options: 'i' } }
            ]
          }
        },
        {
          $project: {
            title: 1,
            book: 1,
            series: 1,
            speaker: 1,
            score: {
              $add: [
                { $cond: [{ $regexMatch: { input: '$title', regex: term, options: 'i' } }, 3, 0] },
                { $cond: [{ $regexMatch: { input: '$book', regex: term, options: 'i' } }, 2, 0] },
                { $cond: [{ $regexMatch: { input: '$series', regex: term, options: 'i' } }, 2, 0] },
                { $cond: [{ $regexMatch: { input: '$speaker', regex: term, options: 'i' } }, 1, 0] }
              ]
            }
          }
        },
        { $sort: { score: -1 } },
        { $limit: limit }
      ]);

      return suggestions;
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar sugestões');
    }
  }

  /**
   * Busca estatísticas dos sermões
   * @returns {Promise<Object>} - Estatísticas
   */
  async getStats() {
    try {
      const stats = await this.model.aggregate([
        {
          $group: {
            _id: null,
            totalSermons: { $sum: 1 },
            totalBooks: { $addToSet: '$book' },
            totalSeries: { $addToSet: '$series' },
            totalSpeakers: { $addToSet: '$speaker' },
            averageDuration: { $avg: '$duration' },
            totalViews: { $sum: '$views' }
          }
        },
        {
          $project: {
            _id: 0,
            totalSermons: 1,
            totalBooks: { $size: '$totalBooks' },
            totalSeries: { $size: '$totalSeries' },
            totalSpeakers: { $size: '$totalSpeakers' },
            averageDuration: { $round: ['$averageDuration', 2] },
            totalViews: 1
          }
        }
      ]);

      return stats[0] || {
        totalSermons: 0,
        totalBooks: 0,
        totalSeries: 0,
        totalSpeakers: 0,
        averageDuration: 0,
        totalViews: 0
      };
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar estatísticas');
    }
  }

  /**
   * Busca todas as séries únicas
   * @returns {Promise<Array>} - Lista de séries
   */
  async getAllSeries() {
    try {
      const series = await this.model.distinct('series');
      return series.filter(Boolean).sort();
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar séries');
    }
  }

  /**
   * Busca todos os pregadores únicos
   * @returns {Promise<Array>} - Lista de pregadores
   */
  async getAllSpeakers() {
    try {
      const speakers = await this.model.distinct('speaker');
      return speakers.filter(Boolean).sort();
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar pregadores');
    }
  }

  /**
   * Busca todos os livros únicos
   * @returns {Promise<Array>} - Lista de livros
   */
  async getAllBooks() {
    try {
      const books = await this.model.distinct('book');
      return books.filter(Boolean).sort((a, b) => a.localeCompare(b));
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar livros');
    }
  }

  /**
   * Busca livros bíblicos únicos
   * @returns {Promise<Array>} - Lista de livros bíblicos
   */
  async findUniqueBooks() {
    try {
      const books = await this.model.aggregate([
        { $match: { book: { $exists: true, $ne: null, $ne: '' } } },
        { $group: { _id: '$book', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { book: '$_id', count: 1, _id: 0 } }
      ]);

      return books;
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar livros únicos');
    }
  }

  /**
   * Incrementa visualizações de um sermão
   * @param {string} id - ID do sermão
   * @returns {Promise<Object>} - Sermão atualizado
   */
  async incrementViews(id) {
    try {
      return await this.model.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      );
    } catch (error) {
      throw this.handleError(error, 'Erro ao incrementar visualizações');
    }
  }

  /**
   * Busca sermões populares
   * @param {number} limit - Limite de sermões
   * @returns {Promise<Array>} - Sermões populares
   */
  async findPopular(limit = 10) {
    try {
      return await this.model.find()
        .sort({ views: -1, createdAt: -1 })
        .limit(limit)
        .select('-__v')
        .exec();
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar sermões populares');
    }
  }

  /**
   * Busca sermões recentes
   * @param {number} limit - Limite de sermões
   * @returns {Promise<Array>} - Sermões recentes
   */
  async findRecent(limit = 10) {
    try {
      return await this.model.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('-__v')
        .exec();
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar sermões recentes');
    }
  }

  /**
   * Cria índices específicos para sermões
   */
  async createSermonIndexes() {
    const indexes = [
      { fields: { title: 'text', content: 'text' }, options: { name: 'sermon_text_search' } },
      { fields: { book: 1 }, options: { name: 'sermon_book_index' } },
      { fields: { series: 1 }, options: { name: 'sermon_series_index' } },
      { fields: { speaker: 1 }, options: { name: 'sermon_speaker_index' } },
      { fields: { createdAt: -1 }, options: { name: 'sermon_created_at_index' } },
      { fields: { views: -1 }, options: { name: 'sermon_views_index' } },
      { fields: { book: 1, series: 1 }, options: { name: 'sermon_book_series_index' } }
    ];

    await this.createIndexes(indexes);
  }
}

module.exports = new SermonRepository(); 