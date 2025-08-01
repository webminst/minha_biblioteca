/**
 * BaseRepository - Classe base para implementar o Repository Pattern
 * Fornece operações CRUD básicas e métodos comuns para todos os repositories
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * Cria um novo documento
   * @param {Object} data - Dados do documento
   * @returns {Promise<Object>} - Documento criado
   */
  async create(data) {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {
      throw this.handleError(error, 'Erro ao criar documento');
    }
  }

  /**
   * Busca documento por ID
   * @param {string} id - ID do documento
   * @param {Object} options - Opções de busca (select, populate, etc.)
   * @returns {Promise<Object|null>} - Documento encontrado ou null
   */
  async findById(id, options = {}) {
    try {
      let query = this.model.findById(id);

      if (options.select) {
        query = query.select(options.select);
      }

      if (options.populate) {
        query = query.populate(options.populate);
      }

      return await query.exec();
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar documento por ID');
    }
  }

  /**
   * Busca todos os documentos com paginação e filtros
   * @param {Object} filters - Filtros de busca
   * @param {Object} options - Opções de busca (page, limit, sort, select, populate)
   * @returns {Promise<Object>} - Objeto com dados e paginação
   */
  async findAll(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sort = { createdAt: -1 },
        select,
        populate
      } = options;

      // Construir query base
      let query = this.model.find(filters);

      // Aplicar select se especificado
      if (select) {
        query = query.select(select);
      }

      // Aplicar populate se especificado
      if (populate) {
        query = query.populate(populate);
      }

      // Aplicar ordenação
      query = query.sort(sort);

      // Contar total de documentos
      const total = await this.model.countDocuments(filters);

      // Aplicar paginação
      const skip = (page - 1) * limit;
      const documents = await query.skip(skip).limit(limit).exec();

      // Calcular informações de paginação
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        data: documents,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null
        }
      };
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar documentos');
    }
  }

  /**
   * Atualiza um documento por ID
   * @param {string} id - ID do documento
   * @param {Object} updateData - Dados para atualização
   * @param {Object} options - Opções de atualização
   * @returns {Promise<Object|null>} - Documento atualizado ou null
   */
  async updateById(id, updateData, options = {}) {
    try {
      const { new: returnNew = true, runValidators = true } = options;

      const updatedDocument = await this.model.findByIdAndUpdate(
        id,
        updateData,
        {
          new: returnNew,
          runValidators,
          ...options
        }
      );

      if (!updatedDocument) {
        const notFoundError = new Error('Documento não encontrado');
        notFoundError.isOperational = true;
        throw notFoundError;
      }

      return updatedDocument;
    } catch (error) {
      throw this.handleError(error, 'Erro ao atualizar documento');
    }
  }

  /**
   * Remove um documento por ID
   * @param {string} id - ID do documento
   * @returns {Promise<boolean>} - true se removido com sucesso
   */
  async deleteById(id) {
    try {
      const result = await this.model.findByIdAndDelete(id);

      if (!result) {
        const notFoundError = new Error('Documento não encontrado');
        notFoundError.isOperational = true;
        throw notFoundError;
      }

      return true;
    } catch (error) {
      throw this.handleError(error, 'Erro ao remover documento');
    }
  }

  /**
   * Busca um documento por critérios específicos
   * @param {Object} criteria - Critérios de busca
   * @param {Object} options - Opções de busca
   * @returns {Promise<Object|null>} - Documento encontrado ou null
   */
  async findOne(criteria, options = {}) {
    try {
      let query = this.model.findOne(criteria);

      if (options.select) {
        query = query.select(options.select);
      }

      if (options.populate) {
        query = query.populate(options.populate);
      }

      return await query.exec();
    } catch (error) {
      throw this.handleError(error, 'Erro ao buscar documento');
    }
  }

  /**
   * Conta documentos baseado em filtros
   * @param {Object} filters - Filtros para contagem
   * @returns {Promise<number>} - Número de documentos
   */
  async count(filters = {}) {
    try {
      return await this.model.countDocuments(filters);
    } catch (error) {
      throw this.handleError(error, 'Erro ao contar documentos');
    }
  }

  /**
   * Executa agregação
   * @param {Array} pipeline - Pipeline de agregação
   * @returns {Promise<Array>} - Resultado da agregação
   */
  async aggregate(pipeline) {
    try {
      return await this.model.aggregate(pipeline);
    } catch (error) {
      throw this.handleError(error, 'Erro ao executar agregação');
    }
  }

  /**
   * Verifica se documento existe
   * @param {Object} criteria - Critérios de busca
   * @returns {Promise<boolean>} - true se existe
   */
  async exists(criteria) {
    try {
      const count = await this.model.countDocuments(criteria);
      return count > 0;
    } catch (error) {
      throw this.handleError(error, 'Erro ao verificar existência');
    }
  }

  /**
   * Busca documentos com busca de texto
   * @param {string} searchTerm - Termo de busca
   * @param {Object} options - Opções de busca
   * @returns {Promise<Array>} - Documentos encontrados
   */
  async search(searchTerm, options = {}) {
    try {
      const {
        fields = [],
        limit = 10,
        sort = { score: { $meta: 'textScore' } }
      } = options;

      if (fields.length === 0) {
        throw new Error('Campos de busca devem ser especificados');
      }

      const searchQuery = {
        $text: { $search: searchTerm }
      };

      let query = this.model.find(searchQuery);

      if (sort) {
        query = query.sort(sort);
      }

      if (limit) {
        query = query.limit(limit);
      }

      return await query.exec();
    } catch (error) {
      throw this.handleError(error, 'Erro na busca de texto');
    }
  }

  /**
   * Trata erros de forma consistente
   * @param {Error} error - Erro original
   * @param {string} message - Mensagem personalizada
   * @returns {Error} - Erro tratado
   */
  handleError(error, message) {
    // Log do erro para debugging
    console.error(`[${this.constructor.name}] ${message}:`, error);

    // Se já é um erro tratado, retorna como está
    if (error.isOperational) {
      return error;
    }

    // Trata erros específicos do Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return new Error(`Erro de validação: ${validationErrors.join(', ')}`);
    }

    if (error.name === 'CastError') {
      return new Error('ID inválido');
    }

    if (error.code === 11000) {
      return new Error('Documento duplicado');
    }

    // Erro genérico
    return new Error(message || 'Erro interno do servidor');
  }

  /**
   * Cria índices para o modelo
   * @param {Array} indexes - Array de definições de índices
   */
  async createIndexes(indexes = []) {
    try {
      for (const index of indexes) {
        await this.model.createIndex(index.fields, index.options);
      }
    } catch (error) {
      console.error(`[${this.constructor.name}] Erro ao criar índices:`, error);
    }
  }
}

module.exports = BaseRepository; 