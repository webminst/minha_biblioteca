import Joi, { Schema } from 'joi';
import { BaseDTO } from '../BaseDTO';

export class CreateBookDTO extends BaseDTO {
    constructor(data: any) {
        super(data);
        this.schema = Joi.object({
            title: Joi.string().required().trim().min(2).max(200).messages({
                'string.empty': 'Título é obrigatório',
                'string.min': 'Título deve ter pelo menos 2 caracteres',
                'string.max': 'Título não pode exceder 200 caracteres'
            }),
            author: Joi.string().required().trim().min(2).max(100).messages({
                'string.empty': 'Autor é obrigatório',
                'string.min': 'Nome do autor deve ter pelo menos 2 caracteres',
                'string.max': 'Nome do autor não pode exceder 100 caracteres'
            }),
            publisher: Joi.string().optional().trim().max(100).allow('').messages({
                'string.max': 'Nome da editora não pode exceder 100 caracteres'
            }),
            area: (BaseDTO as any).commonValidations.area.optional(),
            tags: Joi.array().items((BaseDTO as any).commonValidations.tag).max(10).default([]).messages({
                'array.max': 'Máximo de 10 tags permitidas'
            }),
            description: Joi.string().required().trim().min(10).max(2000).messages({
                'string.empty': 'Descrição é obrigatória',
                'string.min': 'Descrição deve ter pelo menos 10 caracteres',
                'string.max': 'Descrição não pode exceder 2000 caracteres'
            }),
            summary: Joi.string().required().trim().min(50).max(10000).messages({
                'string.empty': 'Resumo é obrigatório',
                'string.min': 'Resumo deve ter pelo menos 50 caracteres',
                'string.max': 'Resumo não pode exceder 10000 caracteres'
            }),
            keyPoints: Joi.array().items(Joi.string().trim().min(5).max(500)).max(20).default([]).messages({
                'array.max': 'Máximo de 20 pontos-chave permitidos'
            }),
            quotes: Joi.array().items(Joi.object({
                text: Joi.string().required().trim().min(10).max(1000),
                page: Joi.number().integer().positive().optional(),
                chapter: Joi.string().trim().max(100).optional()
            })).max(15).default([]).messages({
                'array.max': 'Máximo de 15 citações permitidas'
            }),
            publicationYear: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional().messages({
                'number.min': 'Ano de publicação deve ser posterior a 1900',
                'number.max': 'Ano de publicação não pode ser futuro'
            }),
            series: Joi.string().optional().trim().max(100).allow('').messages({
                'string.max': 'Nome da série não pode exceder 100 caracteres'
            }),
            isbn: Joi.string().optional().pattern(/^(\d{10}|\d{13})$/).messages({
                'string.pattern.base': 'ISBN deve ter 10 ou 13 dígitos'
            }),
            pageCount: Joi.number().integer().positive().max(10000).optional().messages({
                'number.positive': 'Número de páginas deve ser positivo',
                'number.max': 'Número de páginas não pode exceder 10000'
            }),
            personalRating: Joi.number().min(1).max(5).optional().messages({
                'number.min': 'Avaliação deve ser entre 1 e 5',
                'number.max': 'Avaliação deve ser entre 1 e 5'
            }),
            difficulty: Joi.string().valid('Iniciante', 'Intermediário', 'Avançado').optional(),
            purchaseLinks: Joi.array().items(Joi.object({
                store: Joi.string().required().trim().max(50),
                url: (BaseDTO as any).commonValidations.url.required(),
                price: Joi.number().positive().optional()
            })).max(10).default([]).messages({
                'array.max': 'Máximo de 10 links de compra permitidos'
            }),
            isPublished: Joi.boolean().default(true),
            featured: Joi.boolean().default(false)
        });
    }

    transform() {
        const data = this.validatedData || this.data;
        if (data.tags && data.tags.length > 0) {
            data.tags = [...new Set(data.tags.map((tag: string) => tag.toLowerCase().trim()))];
        }
        data.keyPoints = data.keyPoints || [];
        data.quotes = data.quotes || [];
        data.purchaseLinks = data.purchaseLinks || [];
        return data;
    }
}

export class UpdateBookDTO extends BaseDTO {
    constructor(data: any) {
        super(data);
        const createSchema = new CreateBookDTO({}).schema;
        this.schema = createSchema.fork(
            Object.keys(createSchema.describe().keys),
            (schema: any) => schema.optional()
        ).min(1);
    }
    transform() {
        const data = this.validatedData || this.data;
        if (data.tags && data.tags.length > 0) {
            data.tags = [...new Set(data.tags.map((tag: string) => tag.toLowerCase().trim()))];
        }
        return data;
    }
}

export class BookResponseDTO extends BaseDTO {
    constructor(data: any) {
        super(data);
        this.schema = Joi.object({
            _id: (BaseDTO as any).commonValidations.id,
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
            createdBy: (BaseDTO as any).commonValidations.id
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

export class BookSearchDTO extends BaseDTO {
    constructor(data: any) {
        super(data);
        this.schema = Joi.object({
            ...((BaseDTO as any).commonValidations.pagination),
            author: Joi.string().trim().max(100).optional(),
            area: (BaseDTO as any).commonValidations.area.optional(),
            publisher: Joi.string().trim().max(100).optional(),
            series: Joi.string().trim().max(100).optional(),
            difficulty: Joi.string().valid('Iniciante', 'Intermediário', 'Avançado').optional(),
            search: (BaseDTO as any).commonValidations.search.optional(),
            tags: Joi.array().items((BaseDTO as any).commonValidations.tag).max(5).optional(),
            minRating: Joi.number().min(1).max(5).optional(),
            maxRating: Joi.number().min(1).max(5).optional(),
            fromDate: Joi.date().optional(),
            toDate: Joi.date().optional(),
            featured: Joi.boolean().optional(),
            published: Joi.boolean().optional()
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
