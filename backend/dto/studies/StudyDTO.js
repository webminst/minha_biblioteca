// dto/studies/StudyDTO.js
const Joi = require('joi');
const BaseDTO = require('../BaseDTO');

/**
 * DTO para criação de estudos bíblicos
 */
class CreateStudyDTO extends BaseDTO {
    constructor(data) {
        super(data);
        this.schema = Joi.object({
            // Informações básicas
            title: Joi.string()
                .required()
                .trim()
                .min(5)
                .max(200)
                .messages({
                    'string.empty': 'Título é obrigatório',
                    'string.min': 'Título deve ter pelo menos 5 caracteres',
                    'string.max': 'Título não pode exceder 200 caracteres'
                }),

            // Referência bíblica
            biblicalReference: Joi.string()
                .required()
                .trim()
                .min(3)
                .max(100)
                .messages({
                    'string.empty': 'Referência bíblica é obrigatória'
                }),


            book: Joi.string()
                .optional()
                .trim()
                .min(2)
                .max(50),

            chapter: Joi.number()
                .integer()
                .positive()
                .optional(),

            startVerse: Joi.number()
                .integer()
                .positive()
                .optional(),

            endVerse: Joi.number()
                .integer()
                .positive()
                .optional()
                .greater(Joi.ref('startVerse')),

            // Conteúdo do estudo
            introduction: Joi.string()
                .required()
                .trim()
                .min(20)
                .max(2000)
                .messages({
                    'string.empty': 'Introdução é obrigatória',
                    'string.min': 'Introdução deve ter pelo menos 20 caracteres',
                    'string.max': 'Introdução não pode exceder 2000 caracteres'
                }),

            content: Joi.string()
                .required()
                .trim()
                .min(100)
                .max(50000)
                .messages({
                    'string.empty': 'Conteúdo do estudo é obrigatório',
                    'string.min': 'Conteúdo deve ter pelo menos 100 caracteres'
                }),


            sections: Joi.array()
                .items(
                    Joi.object({
                        title: Joi.string().required().trim().min(3).max(200),
                        content: Joi.string().required().trim().min(10).max(5000),
                        verses: Joi.array()
                            .items(
                                Joi.object({
                                    reference: Joi.string().required().trim().max(50),
                                    text: Joi.string().required().trim().max(1000),
                                    version: Joi.string().trim().max(20).default('ARA')
                                })
                            )
                            .max(20)
                            .default([]),
                        keyPoints: Joi.array()
                            .items(Joi.string().trim().min(5).max(300))
                            .max(10)
                            .default([])
                    })
                )
                .max(15)
                .default([])
                .optional()
                .messages({
                    'array.max': 'Máximo de 15 seções permitidas'
                }),

            // Perguntas para reflexão/discussão
            questions: Joi.array()
                .items(
                    Joi.object({
                        question: Joi.string().required().trim().min(10).max(500),
                        type: Joi.string()
                            .valid('reflexão', 'discussão', 'aplicação', 'interpretação')
                            .default('reflexão'),
                        suggestedAnswer: Joi.string().trim().max(1000).optional()
                    })
                )
                .max(20)
                .default([])
                .optional()
                .messages({
                    'array.max': 'Máximo de 20 perguntas permitidas'
                }),


            // Aplicação prática
            application: Joi.string()
                .required()
                .trim()
                .min(20)
                .max(2000)
                .messages({
                    'string.empty': 'Aplicação prática é obrigatória',
                    'string.min': 'Aplicação deve ter pelo menos 20 caracteres'
                }),

            // Categorização
            type: Joi.string()
                .valid(
                    'Exegético',
                    'Temático',
                    'Devocional',
                    'Doutrinário',
                    'Biográfico',
                    'Profético',
                    'Apologético',
                    'Outros'
                )
                .default('Temático')
                .optional(),

            level: Joi.string()
                .valid('Iniciante', 'Intermediário', 'Avançado')
                .default('Intermediário')
                .optional(),

            tags: Joi.array()
                .items(BaseDTO.commonValidations.tag)
                .max(10)
                .default([])
                .optional(),

            // Metadados de série/curso
            series: Joi.string()
                .optional()
                .trim()
                .max(100)
                .allow(''),

            lesson: Joi.number()
                .integer()
                .positive()
                .optional()
                .messages({
                    'number.positive': 'Número da lição deve ser positivo'
                }),

            estimatedDuration: Joi.number()
                .integer()
                .positive()
                .max(480) // máximo 8 horas em minutos
                .optional()
                .messages({
                    'number.max': 'Duração estimada não pode exceder 480 minutos'
                }),


            targetAudience: Joi.string()
                .valid('Geral', 'Novos Convertidos', 'Líderes', 'Jovens', 'Adultos', 'Casais', 'Mulheres', 'Homens')
                .default('Geral')
                .optional(),

            // Recursos adicionais

            resources: Joi.array()
                .items(
                    Joi.object({
                        title: Joi.string().required().trim().max(100),
                        type: Joi.string()
                            .valid('livro', 'artigo', 'vídeo', 'áudio', 'site', 'comentário', 'dicionário')
                            .required(),
                        url: BaseDTO.commonValidations.url.optional(),
                        description: Joi.string().trim().max(300).optional()
                    })
                )
                .max(10)
                .default([])
                .optional(),

            // Versículos-chave memorização

            memoryVerses: Joi.array()
                .items(
                    Joi.object({
                        reference: Joi.string().required().trim().max(50),
                        text: Joi.string().required().trim().max(500),
                        version: Joi.string().trim().max(20).default('ARA'),
                        difficulty: Joi.string()
                            .valid('Fácil', 'Médio', 'Difícil')
                            .default('Médio')
                    })
                )
                .max(5)
                .default([])
                .optional(),


            // Status
            isPublished: Joi.boolean().default(true).optional(),
            featured: Joi.boolean().default(false).optional(),
            allowComments: Joi.boolean().default(true).optional(),

            // Material complementar
            worksheetUrl: BaseDTO.commonValidations.url.optional(),
            audioUrl: BaseDTO.commonValidations.url.optional().allow(''),
            videoUrl: BaseDTO.commonValidations.url.optional().allow(''),
            slidesUrl: BaseDTO.commonValidations.url.optional()
        });
    }

    transform() {
        const data = this.validatedData || this.data;

        // Normaliza tags
        if (data.tags && data.tags.length > 0) {
            data.tags = [...new Set(data.tags.map(tag => tag.toLowerCase().trim()))];
        }

        // Constrói referência bíblica se necessário
        if (!data.biblicalReference && data.book && data.chapter && data.startVerse) {
            const endVerse = data.endVerse ? `-${data.endVerse}` : '';
            data.biblicalReference = `${data.book} ${data.chapter}:${data.startVerse}${endVerse}`;
        }

        // Garante arrays padrão
        data.sections = data.sections || [];
        data.questions = data.questions || [];
        data.resources = data.resources || [];
        data.memoryVerses = data.memoryVerses || [];

        return data;
    }
}

/**
 * DTO para atualização de estudos
 */
class UpdateStudyDTO extends BaseDTO {
    constructor(data) {
        super(data);

        const createSchema = new CreateStudyDTO({}).schema;
        this.schema = createSchema.fork(
            Object.keys(createSchema.describe().keys),
            (schema) => schema.optional()
        ).min(1);
    }

    transform() {
        const data = this.validatedData || this.data;

        if (data.tags && data.tags.length > 0) {
            data.tags = [...new Set(data.tags.map(tag => tag.toLowerCase().trim()))];
        }

        return data;
    }
}

/**
 * DTO para resposta de estudo
 */
class StudyResponseDTO extends BaseDTO {
    constructor(data) {
        super(data);
        this.schema = Joi.object({
            _id: BaseDTO.commonValidations.id,
            title: Joi.string(),
            biblicalReference: Joi.string(),
            book: Joi.string(),
            chapter: Joi.number(),
            startVerse: Joi.number(),
            endVerse: Joi.number(),
            introduction: Joi.string(),
            content: Joi.string(),
            sections: Joi.array(),
            questions: Joi.array(),
            application: Joi.string(),
            type: Joi.string(),
            level: Joi.string(),
            tags: Joi.array().items(Joi.string()),
            series: Joi.string().allow(''),
            lesson: Joi.number(),
            estimatedDuration: Joi.number(),
            targetAudience: Joi.string(),
            resources: Joi.array(),
            memoryVerses: Joi.array(),
            isPublished: Joi.boolean(),
            featured: Joi.boolean(),
            allowComments: Joi.boolean(),
            worksheetUrl: Joi.string().allow(''),
            audioUrl: Joi.string().allow(''),
            videoUrl: Joi.string().allow(''),
            slidesUrl: Joi.string().allow(''),
            views: Joi.number(),
            likes: Joi.number(),
            completions: Joi.number(),
            createdAt: Joi.date(),
            updatedAt: Joi.date(),
            createdBy: BaseDTO.commonValidations.id
        }).unknown(true);
    }

    toPublicObject() {
        const data = this.validatedData || this.data;

        return {
            id: data._id,
            title: data.title,
            biblicalReference: data.biblicalReference,
            book: data.book,
            chapter: data.chapter,
            startVerse: data.startVerse,
            endVerse: data.endVerse || null,
            introduction: data.introduction,
            content: data.content,
            sections: data.sections || [],
            questions: data.questions || [],
            application: data.application,
            type: data.type,
            level: data.level,
            tags: data.tags || [],
            series: data.series || null,
            lesson: data.lesson || null,
            estimatedDuration: data.estimatedDuration || null,
            targetAudience: data.targetAudience,
            resources: data.resources || [],
            memoryVerses: data.memoryVerses || [],
            isPublished: data.isPublished,
            featured: data.featured || false,
            allowComments: data.allowComments,
            worksheetUrl: data.worksheetUrl || null,
            audioUrl: data.audioUrl || null,
            videoUrl: data.videoUrl || null,
            slidesUrl: data.slidesUrl || null,
            views: data.views || 0,
            likes: data.likes || 0,
            completions: data.completions || 0,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
    }

    toSummaryObject() {
        const data = this.validatedData || this.data;

        return {
            id: data._id,
            title: data.title,
            biblicalReference: data.biblicalReference,
            type: data.type,
            level: data.level,
            targetAudience: data.targetAudience,
            tags: data.tags?.slice(0, 3) || [],
            introduction: data.introduction?.substring(0, 150) + '...' || '',
            series: data.series || null,
            lesson: data.lesson || null,
            estimatedDuration: data.estimatedDuration || null,
            featured: data.featured || false,
            views: data.views || 0,
            completions: data.completions || 0,
            createdAt: data.createdAt
        };
    }
}

/**
 * DTO para busca de estudos
 */
class StudySearchDTO extends BaseDTO {
    constructor(data) {
        super(data);
        this.schema = Joi.object({
            // Paginação
            page: Joi.number().integer().positive().default(1),
            limit: Joi.number().integer().positive().max(100).default(10),
            sortBy: Joi.string().valid('title', 'date', 'createdAt', 'updatedAt').default('createdAt'),
            sortOrder: Joi.string().valid('asc', 'desc').default('desc'),

            // Filtros específicos
            type: Joi.string()
                .valid(
                    'Exegético',
                    'Temático',
                    'Devocional',
                    'Doutrinário',
                    'Biográfico',
                    'Profético',
                    'Apologético',
                    'Outros'
                )
                .optional(),

            level: Joi.string()
                .valid('Iniciante', 'Intermediário', 'Avançado')
                .optional(),

            targetAudience: Joi.string()
                .valid('Geral', 'Novos Convertidos', 'Líderes', 'Jovens', 'Adultos', 'Casais', 'Mulheres', 'Homens')
                .optional(),

            book: Joi.string().trim().max(50).optional(),
            series: Joi.string().trim().max(100).optional(),

            // Busca
            search: BaseDTO.commonValidations.search.optional(),
            tags: Joi.array()
                .items(BaseDTO.commonValidations.tag)
                .max(5)
                .optional(),

            // Filtros de duração
            minDuration: Joi.number().integer().positive().optional(),
            maxDuration: Joi.number().integer().positive().optional(),

            // Filtros de data
            fromDate: Joi.date().optional(),
            toDate: Joi.date().optional(),

            // Filtros booleanos
            featured: Joi.boolean().optional(),
            published: Joi.boolean().optional(),
            allowComments: Joi.boolean().optional(),

            // Filtros específicos de estudo
            hasWorksheet: Joi.boolean().optional(),
            hasAudio: Joi.boolean().optional(),
            hasVideo: Joi.boolean().optional(),
            hasSlides: Joi.boolean().optional()
        });
    }

    transform() {
        const data = this.validatedData || this.data;

        // Validações de lógica
        if (data.minDuration && data.maxDuration && data.minDuration > data.maxDuration) {
            throw new Error('Duração mínima não pode ser maior que a máxima');
        }

        if (data.fromDate && data.toDate && data.fromDate > data.toDate) {
            throw new Error('Data inicial não pode ser posterior à data final');
        }

        return data;
    }
}

module.exports = {
    CreateStudyDTO,
    UpdateStudyDTO,
    StudyResponseDTO,
    StudySearchDTO
};
