"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookSearchDTO = exports.BookResponseDTO = exports.UpdateBookDTO = exports.CreateBookDTO = void 0;
const joi_1 = __importDefault(require("joi"));
const BaseDTO_1 = require("../BaseDTO");
class CreateBookDTO extends BaseDTO_1.BaseDTO {
    constructor(data) {
        super(data);
        this.schema = joi_1.default.object({
            title: joi_1.default.string().required().trim().min(2).max(200).messages({
                'string.empty': 'Título é obrigatório',
                'string.min': 'Título deve ter pelo menos 2 caracteres',
                'string.max': 'Título não pode exceder 200 caracteres'
            }),
            author: joi_1.default.string().required().trim().min(2).max(100).messages({
                'string.empty': 'Autor é obrigatório',
                'string.min': 'Nome do autor deve ter pelo menos 2 caracteres',
                'string.max': 'Nome do autor não pode exceder 100 caracteres'
            }),
            publisher: joi_1.default.string().optional().trim().max(100).allow('').messages({
                'string.max': 'Nome da editora não pode exceder 100 caracteres'
            }),
            area: BaseDTO_1.BaseDTO.commonValidations.area.optional(),
            tags: joi_1.default.array().items(BaseDTO_1.BaseDTO.commonValidations.tag).max(10).default([]).messages({
                'array.max': 'Máximo de 10 tags permitidas'
            }),
            description: joi_1.default.string().required().trim().min(10).max(2000).messages({
                'string.empty': 'Descrição é obrigatória',
                'string.min': 'Descrição deve ter pelo menos 10 caracteres',
                'string.max': 'Descrição não pode exceder 2000 caracteres'
            }),
            summary: joi_1.default.string().required().trim().min(50).max(20000).messages({
                'string.empty': 'Resumo é obrigatório',
                'string.min': 'Resumo deve ter pelo menos 50 caracteres',
                'string.max': 'Resumo não pode exceder 20000 caracteres'
            }),
            keyPoints: joi_1.default.array().items(joi_1.default.string().trim().min(5).max(500)).max(20).default([]).messages({
                'array.max': 'Máximo de 20 pontos-chave permitidos'
            }),
            quotes: joi_1.default.array().items(joi_1.default.object({
                text: joi_1.default.string().required().trim().min(10).max(1000),
                page: joi_1.default.number().integer().positive().optional(),
                chapter: joi_1.default.string().trim().max(100).optional()
            })).max(15).default([]).messages({
                'array.max': 'Máximo de 15 citações permitidas'
            }),
            publicationYear: joi_1.default.number().integer().min(1900).max(new Date().getFullYear()).optional().messages({
                'number.min': 'Ano de publicação deve ser posterior a 1900',
                'number.max': 'Ano de publicação não pode ser futuro'
            }),
            series: joi_1.default.string().optional().trim().max(100).allow('').messages({
                'string.max': 'Nome da série não pode exceder 100 caracteres'
            }),
            isbn: joi_1.default.string().optional().pattern(/^(\d{10}|\d{13})$/).messages({
                'string.pattern.base': 'ISBN deve ter 10 ou 13 dígitos'
            }),
            pageCount: joi_1.default.number().integer().positive().max(10000).optional().messages({
                'number.positive': 'Número de páginas deve ser positivo',
                'number.max': 'Número de páginas não pode exceder 10000'
            }),
            personalRating: joi_1.default.number().min(1).max(5).optional().messages({
                'number.min': 'Avaliação deve ser entre 1 e 5',
                'number.max': 'Avaliação deve ser entre 1 e 5'
            }),
            difficulty: joi_1.default.string().valid('Iniciante', 'Intermediário', 'Avançado').optional(),
            purchaseLinks: joi_1.default.array().items(joi_1.default.object({
                store: joi_1.default.string().required().trim().max(50),
                url: BaseDTO_1.BaseDTO.commonValidations.url.required(),
                price: joi_1.default.number().positive().optional()
            })).max(10).default([]).messages({
                'array.max': 'Máximo de 10 links de compra permitidos'
            }),
            isPublished: joi_1.default.boolean().default(true),
            featured: joi_1.default.boolean().default(false)
        });
    }
    transform() {
        const data = this.validatedData || this.data;
        if (data.tags && data.tags.length > 0) {
            data.tags = [...new Set(data.tags.map((tag) => tag.toLowerCase().trim()))];
        }
        data.keyPoints = data.keyPoints || [];
        data.quotes = data.quotes || [];
        data.purchaseLinks = data.purchaseLinks || [];
        return data;
    }
}
exports.CreateBookDTO = CreateBookDTO;
class UpdateBookDTO extends BaseDTO_1.BaseDTO {
    constructor(data) {
        super(data);
        const createSchema = new CreateBookDTO({}).schema;
        this.schema = createSchema.fork(Object.keys(createSchema.describe().keys), (schema) => schema.optional()).min(1);
    }
    transform() {
        const data = this.validatedData || this.data;
        if (data.tags && data.tags.length > 0) {
            data.tags = [...new Set(data.tags.map((tag) => tag.toLowerCase().trim()))];
        }
        return data;
    }
}
exports.UpdateBookDTO = UpdateBookDTO;
class BookResponseDTO extends BaseDTO_1.BaseDTO {
    constructor(data) {
        super(data);
        this.schema = joi_1.default.object({
            _id: BaseDTO_1.BaseDTO.commonValidations.id,
            title: joi_1.default.string(),
            author: joi_1.default.string(),
            publisher: joi_1.default.string().allow(''),
            area: joi_1.default.string().allow(''),
            tags: joi_1.default.array().items(joi_1.default.string()),
            description: joi_1.default.string(),
            summary: joi_1.default.string(),
            keyPoints: joi_1.default.array().items(joi_1.default.string()),
            quotes: joi_1.default.array(),
            publicationYear: joi_1.default.number(),
            series: joi_1.default.string().allow(''),
            isbn: joi_1.default.string().allow(''),
            pageCount: joi_1.default.number(),
            personalRating: joi_1.default.number(),
            difficulty: joi_1.default.string().allow(''),
            purchaseLinks: joi_1.default.array(),
            isPublished: joi_1.default.boolean(),
            featured: joi_1.default.boolean(),
            views: joi_1.default.number(),
            likes: joi_1.default.number(),
            createdAt: joi_1.default.date(),
            updatedAt: joi_1.default.date(),
            createdBy: BaseDTO_1.BaseDTO.commonValidations.id
        }).unknown(true);
    }
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
    toSummaryObject() {
        const data = this.validatedData || this.data;
        return {
            id: data._id,
            title: data.title,
            author: data.author,
            area: data.area || null,
            tags: data.tags?.slice(0, 3) || [],
            description: data.description?.substring(0, 200) + '...' || '',
            personalRating: data.personalRating || null,
            difficulty: data.difficulty || null,
            featured: data.featured || false,
            views: data.views || 0,
            createdAt: data.createdAt
        };
    }
}
exports.BookResponseDTO = BookResponseDTO;
class BookSearchDTO extends BaseDTO_1.BaseDTO {
    constructor(data) {
        super(data);
        this.schema = joi_1.default.object({
            ...(BaseDTO_1.BaseDTO.commonValidations.pagination),
            author: joi_1.default.string().trim().max(100).optional(),
            area: BaseDTO_1.BaseDTO.commonValidations.area.optional(),
            publisher: joi_1.default.string().trim().max(100).optional(),
            series: joi_1.default.string().trim().max(100).optional(),
            difficulty: joi_1.default.string().valid('Iniciante', 'Intermediário', 'Avançado').optional(),
            search: BaseDTO_1.BaseDTO.commonValidations.search.optional(),
            tags: joi_1.default.array().items(BaseDTO_1.BaseDTO.commonValidations.tag).max(5).optional(),
            minRating: joi_1.default.number().min(1).max(5).optional(),
            maxRating: joi_1.default.number().min(1).max(5).optional(),
            fromDate: joi_1.default.date().optional(),
            toDate: joi_1.default.date().optional(),
            featured: joi_1.default.boolean().optional(),
            published: joi_1.default.boolean().optional()
        });
    }
    transform() {
        const data = this.validatedData || this.data;
        if (data.minRating && data.maxRating && data.minRating > data.maxRating) {
            throw new Error('Rating mínimo não pode ser maior que o máximo');
        }
        if (data.fromDate && data.toDate && data.fromDate > data.toDate) {
            throw new Error('Data inicial não pode ser posterior à data final');
        }
        return data;
    }
}
exports.BookSearchDTO = BookSearchDTO;
