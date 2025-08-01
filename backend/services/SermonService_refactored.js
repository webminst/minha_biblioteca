const sermonRepository = require('../repositories/SermonRepository');
const AppError = require('../middleware/errorHandler').AppError;

/**
 * SermonService - Serviço refatorado usando Repository Pattern
 * Foca na lógica de negócio e delega operações de dados para o repository
 */
class SermonService {
  constructor() {
    this.repository = sermonRepository;
  }

  /**
   * Busca todos os sermões com filtros e paginação
   * @param {Object} options - Opções de busca
   * @returns {Promise<Object>} - Sermões com paginação
   */
  async findAll(options = {}) {
    try {
      return await this.repository.findSermons({}, options);
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Busca sermão por ID
   * @param {string} id - ID do sermão
   * @returns {Promise<Object>} - Sermão encontrado
   */
  async findById(id) {
    try {
      const sermon = await this.repository.findById(id);
      
      if (!sermon) {
        throw new AppError('Sermão não encontrado', 404);
      }
      
      // Incrementa visualizações
      await this.repository.incrementViews(id);
      
      return sermon;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Cria um novo sermão
   * @param {Object} sermonData - Dados do sermão
   * @param {string} userId - ID do usuário criador
   * @returns {Promise<Object>} - Sermão criado
   */
  async create(sermonData, userId) {
    try {
      // Validação básica
      if (!sermonData.title || !sermonData.content) {
        throw new AppError('Título e conteúdo são obrigatórios', 400);
      }

      // Adiciona metadados
      const sermonToCreate = {
        ...sermonData,
        createdBy: userId,
        updatedBy: userId,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return await this.repository.create(sermonToCreate);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Atualiza um sermão
   * @param {string} id - ID do sermão
   * @param {Object} updateData - Dados para atualização
   * @param {string} userId - ID do usuário que está atualizando
   * @returns {Promise<Object>} - Sermão atualizado
   */
  async update(id, updateData, userId) {
    try {
      // Verifica se o sermão existe
      const existingSermon = await this.repository.findById(id);
      if (!existingSermon) {
        throw new AppError('Sermão não encontrado', 404);
      }

      // Adiciona metadados de atualização
      const sermonToUpdate = {
        ...updateData,
        updatedBy: userId,
        updatedAt: new Date()
      };

      return await this.repository.updateById(id, sermonToUpdate);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Remove um sermão
   * @param {string} id - ID do sermão
   * @returns {Promise<boolean>} - true se removido com sucesso
   */
  async delete(id) {
    try {
      // Verifica se o sermão existe
      const existingSermon = await this.repository.findById(id);
      if (!existingSermon) {
        throw new AppError('Sermão não encontrado', 404);
      }

      return await this.repository.deleteById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Busca o sermão mais recente
   * @returns {Promise<Object|null>} - Sermão mais recente
   */
  async findLatest() {
    try {
      return await this.repository.findLatest();
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Busca sermões por série
   * @param {string} series - Nome da série
   * @param {Object} options - Opções de busca
   * @returns {Promise<Object>} - Sermões da série
   */
  async findBySeries(series, options = {}) {
    try {
      if (!series) {
        throw new AppError('Nome da série é obrigatório', 400);
      }

      return await this.repository.findBySeries(series, options);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Busca sermões por pregador
   * @param {string} speaker - Nome do pregador
   * @param {Object} options - Opções de busca
   * @returns {Promise<Object>} - Sermões do pregador
   */
  async findBySpeaker(speaker, options = {}) {
    try {
      if (!speaker) {
        throw new AppError('Nome do pregador é obrigatório', 400);
      }

      return await this.repository.findBySpeaker(speaker, options);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Busca sermões por livro bíblico
   * @param {string} book - Nome do livro
   * @param {Object} options - Opções de busca
   * @returns {Promise<Object>} - Sermões do livro
   */
  async findByBook(book, options = {}) {
    try {
      if (!book) {
        throw new AppError('Nome do livro é obrigatório', 400);
      }

      return await this.repository.findByBook(book, options);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(error.message, 500);
    }
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

      return await this.repository.findSuggestions(term, limit);
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Busca estatísticas dos sermões
   * @returns {Promise<Object>} - Estatísticas
   */
  async getStats() {
    try {
      return await this.repository.getStats();
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Busca todas as séries únicas
   * @returns {Promise<Array>} - Lista de séries
   */
  async getAllSeries() {
    try {
      return await this.repository.getAllSeries();
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Busca todos os pregadores únicos
   * @returns {Promise<Array>} - Lista de pregadores
   */
  async getAllSpeakers() {
    try {
      return await this.repository.getAllSpeakers();
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Busca todos os livros únicos
   * @returns {Promise<Array>} - Lista de livros
   */
  async getAllBooks() {
    try {
      return await this.repository.getAllBooks();
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Busca livros bíblicos únicos
   * @returns {Promise<Array>} - Lista de livros bíblicos
   */
  async findUniqueBooks() {
    try {
      return await this.repository.findUniqueBooks();
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Busca sermões populares
   * @param {number} limit - Limite de sermões
   * @returns {Promise<Array>} - Sermões populares
   */
  async findPopular(limit = 10) {
    try {
      return await this.repository.findPopular(limit);
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Busca sermões recentes
   * @param {number} limit - Limite de sermões
   * @returns {Promise<Array>} - Sermões recentes
   */
  async findRecent(limit = 10) {
    try {
      return await this.repository.findRecent(limit);
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Busca sermões com filtros avançados
   * @param {Object} filters - Filtros de busca
   * @param {Object} options - Opções de busca
   * @returns {Promise<Object>} - Sermões com paginação
   */
  async search(filters = {}, options = {}) {
    try {
      return await this.repository.findSermons(filters, options);
    } catch (error) {
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Inicializa índices do banco de dados
   */
  async initializeIndexes() {
    try {
      await this.repository.createSermonIndexes();
      console.log('✅ Índices dos sermões criados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar índices dos sermões:', error.message);
    }
  }
}

module.exports = new SermonService(); 