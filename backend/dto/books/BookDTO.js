// dto/books/BookDTO.js
const Joi = require('joi');
const BaseDTO = require('../BaseDTO');

/**
 * DTO para criação de livros
 */
class CreateBookDTO extends BaseDTO {
    constructor(data) {
        super(data);
        this.schema = Joi.object({
            // Informações básicas
            title: Joi.string()
                .required()
                .trim()
                .min(2)
                .max(200)
                .messages({
                    'string.empty': 'Título é obrigatório',
                    'string.min': 'Título deve ter pelo menos 2 caracteres',
                    'string.max': 'Título não pode exceder 200 caracteres'
                }),

            author: Joi.string()
                .required()
                .trim()
                .min(2)
                .max(100)
                .messages({
                    'string.empty': 'Autor é obrigatório',
                    'string.min': 'Nome do autor deve ter pelo menos 2 caracteres',
                    'string.max': 'Nome do autor não pode exceder 100 caracteres'
                }),

            publisher: Joi.string()
                .optional()
                .trim()
                .max(100)
                .allow('')
                .messages({
                    'string.max': 'Nome da editora não pode exceder 100 caracteres'
                }),

            // Categorização
            area: BaseDTO.commonValidations.area.optional(),

            tags: Joi.array()
                .items(BaseDTO.commonValidations.tag)
                .max(10)
                .default([])
                .messages({
                    'array.max': 'Máximo de 10 tags permitidas'
                }),

            // Conteúdo
            description: Joi.string()
                .required()
                .trim()
                .min(10)
                .max(2000)
                .messages({
                    'string.empty': 'Descrição é obrigatória',
                    'string.min': 'Descrição deve ter pelo menos 10 caracteres',
                    'string.max': 'Descrição não pode exceder 2000 caracteres'
                }),

            summary: Joi.string()
                .required()
                .trim()
                .min(50)
                .max(20000)
                .messages({
                    'string.empty': 'Resumo é obrigatório',
                    'string.min': 'Resumo deve ter pelo menos 50 caracteres',
                    'string.max': 'Resumo não pode exceder 20000 caracteres'
                }),

            keyPoints: Joi.array()
                .items(
                    Joi.string()
                        .trim()
                        .min(5)
                        .max(500)
                )
                .max(20)
                .default([])
                .messages({
                    'array.max': 'Máximo de 20 pontos-chave permitidos'
                }),

            quotes: Joi.array()
                .items(
                    Joi.object({
                        text: Joi.string().required().trim().min(10).max(1000),
                        page: Joi.number().integer().positive().optional(),
                        chapter: Joi.string().trim().max(100).optional()
                    })
                )
                .max(15)
                .default([])
                .messages({
                    'array.max': 'Máximo de 15 citações permitidas'
                }),

            // Metadados de publicação
            publicationYear: Joi.number()
                .integer()
                .min(1900)
                .max(new Date().getFullYear())
                .optional()
                .messages({
                    'number.min': 'Ano de publicação deve ser posterior a 1900',
                    'number.max': 'Ano de publicação não pode ser futuro'
                }),

            series: Joi.string()
                .optional()
                .trim()
                .max(100)
                .allow('')
                .messages({
                    'string.max': 'Nome da série não pode exceder 100 caracteres'
                }),

            isbn: Joi.string()
                .optional()
                .pattern(/^(\d{10}|\d{13})$/)
                .messages({
                    'string.pattern.base': 'ISBN deve ter 10 ou 13 dígitos'
                }),

            pageCount: Joi.number()
                .integer()
                .positive()
                .max(10000)
                .optional()
                .messages({
                    'number.positive': 'Número de páginas deve ser positivo',
                    'number.max': 'Número de páginas não pode exceder 10000'
                }),

            // Avaliação
            personalRating: Joi.number()
                .min(1)
                .max(5)
                .optional()
                .messages({
                    'number.min': 'Avaliação deve ser entre 1 e 5',
                    'number.max': 'Avaliação deve ser entre 1 e 5'
                }),

            difficulty: Joi.string()
                .valid('Iniciante', 'Intermediário', 'Avançado')
                .optional(),

            // Links e recursos
            purchaseLinks: Joi.array()
                .items(
                    Joi.object({
                        store: Joi.string().required().trim().max(50),
                        url: BaseDTO.commonValidations.url.required(),
                        price: Joi.number().positive().optional()
                    })
                )
                .max(10)
                .default([])
                .messages({
                    'array.max': 'Máximo de 10 links de compra permitidos'
                }),

            // Status
            isPublished: Joi.boolean().default(true),
            featured: Joi.boolean().default(false)
        });
    }

    /**
     * Transforma os dados para criação no banco
     */
    transform() {
        const data = this.validatedData || this.data;

        // Garante que area nunca seja array e não contenha vírgula
        if (Array.isArray(data.area)) {
            throw new Error('O campo area deve ser uma string, não um array.');
        }
        if (typeof data.area === 'string' && data.area.includes(',')) {
            throw new Error('O campo area deve ser uma única área, sem vírgulas ou múltiplos valores.');
        }

        // Normaliza tags removendo duplicatas e convertendo para lowercase
        if (data.tags && data.tags.length > 0) {
            data.tags = [...new Set(data.tags.map(tag => tag.toLowerCase().trim()))];
        }

        // Garante que arrays vazios sejam definidos
        data.keyPoints = data.keyPoints || [];
        data.quotes = data.quotes || [];
        data.purchaseLinks = data.purchaseLinks || [];

        return data;
    }
}

/**
 * DTO para atualização de livros
 */
class UpdateBookDTO extends BaseDTO {
    constructor(data) {
        super(data);

        // Reutiliza o schema de criação, mas torna todos os campos opcionais
        const createSchema = new CreateBookDTO({}).schema;

        this.schema = createSchema.fork(
            Object.keys(createSchema.describe().keys),
            (schema) => schema.optional()
        ).min(1); // Pelo menos um campo deve ser fornecido
    }

    transform() {
        const data = this.validatedData || this.data;

        // Aplica as mesmas transformações do CreateBookDTO
        if (data.tags && data.tags.length > 0) {
            data.tags = [...new Set(data.tags.map(tag => tag.toLowerCase().trim()))];
        }

        return data;
    }
}

/**
 * DTO para resposta de livro (saída)
 */
class BookResponseDTO extends BaseDTO {
    constructor(data) {
        super(data);
        // Este DTO é mais permissivo pois é para saída de dados
        this.schema = Joi.object({
            _id: BaseDTO.commonValidations.id,
            title: Joi.string(),
            author: Joi.string(),
            publisher: Joi.string().allow(''),
            area: Joi.string().allow(''),
            tags: Joi.array().items(Joi.string()),
            description: Joi.string(),
            summary: Joi.string(),
            keyPoints: Joi.array().items(Joi.string()),
            quotes: Joi.array(),
            publicationYear: Joi.number(),
            series: Joi.string().allow(''),
            isbn: Joi.string().allow(''),
            pageCount: Joi.number(),
            personalRating: Joi.number(),
            difficulty: Joi.string().allow(''),
            purchaseLinks: Joi.array(),
            isPublished: Joi.boolean(),
            featured: Joi.boolean(),
            views: Joi.number(),
            likes: Joi.number(),
            createdAt: Joi.date(),
            updatedAt: Joi.date(),
            createdBy: BaseDTO.commonValidations.id
        }).unknown(true); // Permite campos adicionais
    }

    /**
     * Formata dados para resposta pública
     */
    toPublicObject() {
        const data = this.validatedData || this.data;

        return {
            id: data._id,
            title: data.title,
            author: data.author,
            publisher: data.publisher || null,
            area: data.area || null,
            tags: data.tags || [],
            description: data.description,
            summary: data.summary,
            keyPoints: data.keyPoints || [],
            quotes: data.quotes || [],
            publicationYear: data.publicationYear || null,
            series: data.series || null,
            isbn: data.isbn || null,
            pageCount: data.pageCount || null,
            personalRating: data.personalRating || null,
            difficulty: data.difficulty || null,
            purchaseLinks: data.purchaseLinks || [],
            isPublished: data.isPublished,
            featured: data.featured || false,
            views: data.views || 0,
            likes: data.likes || 0,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
    }

    /**
     * Versão resumida para listagens
     */
    toSummaryObject() {
        const data = this.validatedData || this.data;

        return {
            id: data._id,
            title: data.title,
            author: data.author,
            area: data.area || null,
            tags: data.tags?.slice(0, 3) || [], // Apenas 3 primeiras tags
            description: data.description?.substring(0, 200) + '...' || '',
            personalRating: data.personalRating || null,
            difficulty: data.difficulty || null,
            featured: data.featured || false,
            views: data.views || 0,
            createdAt: data.createdAt
        };
    }
}

/**
 * DTO para busca e filtros de livros
 */
class BookSearchDTO extends BaseDTO {
    constructor(data) {
        super(data);
        this.schema = Joi.object({
            // Paginação
            ...BaseDTO.commonValidations.pagination,

            // Filtros
            author: Joi.string().trim().max(100).optional(),
            area: BaseDTO.commonValidations.area.optional(),
            publisher: Joi.string().trim().max(100).optional(),
            series: Joi.string().trim().max(100).optional(),
            difficulty: Joi.string()
                .valid('Iniciante', 'Intermediário', 'Avançado')
                .optional(),

            // Busca
            search: BaseDTO.commonValidations.search.optional(),
            tags: Joi.array()
                .items(BaseDTO.commonValidations.tag)
                .max(5)
                .optional(),

            // Filtros de rating
            minRating: Joi.number().min(1).max(5).optional(),
            maxRating: Joi.number().min(1).max(5).optional(),

            // Filtros de data
            fromDate: Joi.date().optional(),
            toDate: Joi.date().optional(),

            // Filtros booleanos
            featured: Joi.boolean().optional(),
            published: Joi.boolean().optional()
        });
    }

    transform() {
        const data = this.validatedData || this.data;

        // Valida lógica de ratings
        if (data.minRating && data.maxRating && data.minRating > data.maxRating) {
            throw new Error('Rating mínimo não pode ser maior que o máximo');
        }

        // Valida lógica de datas
        if (data.fromDate && data.toDate && data.fromDate > data.toDate) {
            throw new Error('Data inicial não pode ser posterior à data final');
        }

        return data;
    }
}

module.exports = {
    CreateBookDTO,
    UpdateBookDTO,
    BookResponseDTO,
    BookSearchDTO
};
