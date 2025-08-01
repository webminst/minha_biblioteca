// dto/common/ResponseDTO.js
const Joi = require('joi');
const BaseDTO = require('../BaseDTO');

/**
 * DTO para padronizar respostas da API
 */
class ApiResponseDTO extends BaseDTO {
  constructor(data) {
    super(data);
    this.schema = Joi.object({
      success: Joi.boolean().required(),
      message: Joi.string().optional(),
      data: Joi.any().optional(),
      errors: Joi.array().items(
        Joi.object({
          field: Joi.string().optional(),
          message: Joi.string().required(),
          code: Joi.string().optional(),
        }),
      ).optional(),
      pagination: Joi.object({
        currentPage: Joi.number().integer().positive(),
        totalPages: Joi.number().integer().min(0),
        totalItems: Joi.number().integer().min(0),
        itemsPerPage: Joi.number().integer().positive(),
        hasNextPage: Joi.boolean(),
        hasPrevPage: Joi.boolean(),
      }).optional(),
      meta: Joi.object().optional(),
    });
  }

  /**
     * Cria uma resposta de sucesso padronizada
     */
  static success(data, message = null, pagination = null, meta = null) {
    return {
      success: true,
      message,
      data,
      pagination,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  /**
     * Cria uma resposta de erro padronizada
     */
  static error(message, errors = null, statusCode = 400) {
    return {
      success: false,
      message,
      errors,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  /**
     * Cria resposta paginada
     */
  static paginated(data, pagination, message = null) {
    return this.success(data, message, pagination);
  }
}

/**
 * DTO para paginação
 */
class PaginationDTO extends BaseDTO {
  constructor(data) {
    super(data);
    this.schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      totalItems: Joi.number().integer().min(0).required(),
      totalPages: Joi.number().integer().min(0).optional(),
      hasNextPage: Joi.boolean().optional(),
      hasPrevPage: Joi.boolean().optional(),
    });
  }

  transform() {
    const data = this.validatedData || this.data;

    // Calcula valores derivados
    data.totalPages = Math.ceil(data.totalItems / data.limit);
    data.hasNextPage = data.page < data.totalPages;
    data.hasPrevPage = data.page > 1;

    return {
      currentPage: data.page,
      totalPages: data.totalPages,
      totalItems: data.totalItems,
      itemsPerPage: data.limit,
      hasNextPage: data.hasNextPage,
      hasPrevPage: data.hasPrevPage,
    };
  }

  /**
     * Cria paginação a partir de parâmetros de consulta
     */
  static fromQuery(query, totalItems) {
    const pagination = new PaginationDTO({
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      totalItems,
    });

    const validation = pagination.validate();
    if (!validation.isValid) {
      throw new Error('Parâmetros de paginação inválidos');
    }

    return pagination.transform();
  }
}

/**
 * DTO para validação de IDs do MongoDB
 */
class MongoIdDTO extends BaseDTO {
  constructor(data) {
    super(data);
    this.schema = Joi.object({
      id: BaseDTO.commonValidations.id.required(),
    });
  }

  static validate(id) {
    const instance = new MongoIdDTO({ id });
    const validation = instance.validate();

    if (!validation.isValid) {
      throw new Error('ID inválido');
    }

    return validation.data.id;
  }
}

/**
 * DTO para filtros de busca comuns
 */
class SearchFiltersDTO extends BaseDTO {
  constructor(data) {
    super(data);
    this.schema = Joi.object({
      search: BaseDTO.commonValidations.search.optional(),
      tags: Joi.array()
        .items(BaseDTO.commonValidations.tag)
        .max(5)
        .optional(),
      fromDate: Joi.date().optional(),
      toDate: Joi.date().optional(),
      featured: Joi.boolean().optional(),
      published: Joi.boolean().optional(),
      sortBy: Joi.string()
        .valid('createdAt', 'updatedAt', 'title', 'views', 'likes')
        .default('createdAt'),
      sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc'),
    });
  }

  transform() {
    const data = this.validatedData || this.data;

    // Validações de lógica de data
    if (data.fromDate && data.toDate && data.fromDate > data.toDate) {
      throw new Error('Data inicial não pode ser posterior à data final');
    }

    // Normaliza tags
    if (data.tags && data.tags.length > 0) {
      data.tags = [...new Set(data.tags.map(tag => tag.toLowerCase().trim()))];
    }

    return data;
  }
}

/**
 * DTO para estatísticas
 */
class StatsDTO extends BaseDTO {
  constructor(data) {
    super(data);
    this.schema = Joi.object({
      totalItems: Joi.number().integer().min(0).default(0),
      totalViews: Joi.number().integer().min(0).default(0),
      totalLikes: Joi.number().integer().min(0).default(0),
      featuredItems: Joi.number().integer().min(0).default(0),
      recentItems: Joi.number().integer().min(0).default(0),
      topTags: Joi.array().items(
        Joi.object({
          tag: Joi.string(),
          count: Joi.number().integer().min(0),
        }),
      ).default([]),
      monthlyStats: Joi.array().items(
        Joi.object({
          month: Joi.string(),
          count: Joi.number().integer().min(0),
        }),
      ).default([]),
      lastUpdated: Joi.date().default(() => new Date()),
    });
  }

  toPublicObject() {
    const data = this.validatedData || this.data;

    return {
      summary: {
        total: data.totalItems,
        views: data.totalViews,
        likes: data.totalLikes,
        featured: data.featuredItems,
        recent: data.recentItems,
      },
      topTags: data.topTags.slice(0, 10), // Limita a 10 tags mais populares
      monthlyActivity: data.monthlyStats.slice(-12), // Últimos 12 meses
      lastUpdated: data.lastUpdated,
    };
  }
}

module.exports = {
  ApiResponseDTO,
  PaginationDTO,
  MongoIdDTO,
  SearchFiltersDTO,
  StatsDTO,
};
