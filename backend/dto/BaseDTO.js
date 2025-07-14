// dto/BaseDTO.js
const Joi = require('joi');

/**
 * Classe base para Data Transfer Objects
 * Fornece funcionalidades comuns de validação e transformação
 */
class BaseDTO {
    constructor(data = {}) {
        this.data = data;
        this.errors = [];
    }

    /**
     * Valida os dados usando o schema Joi definido na classe filha
     * @returns {Object} - Dados validados ou erro
     */
    validate() {
        if (!this.schema) {
            throw new Error('Schema de validação não definido na classe DTO');
        }

        const { error, value } = this.schema.validate(this.data, {
            abortEarly: false, // Coleta todos os erros, não apenas o primeiro
            stripUnknown: true, // Remove campos não definidos no schema
            convert: true // Converte tipos automaticamente quando possível
        });

        if (error) {
            this.errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));
            return { isValid: false, errors: this.errors };
        }

        this.validatedData = value;
        return { isValid: true, data: value };
    }

    /**
     * Transforma os dados para um formato específico
     * Deve ser implementado nas classes filhas conforme necessário
     */
    transform() {
        return this.validatedData || this.data;
    }

    /**
     * Retorna apenas os campos seguros para exposição pública
     * Remove campos sensíveis como senhas, tokens, etc.
     */
    toSafeObject() {
        const transformed = this.transform();
        // Remove campos sensíveis por padrão
        const { password, token, ...safeData } = transformed;
        return safeData;
    }

    /**
     * Utilitário para criar validações comuns
     */
    static commonValidations = {
        id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .message('ID deve ser um ObjectId válido'),

        email: Joi.string()
            .email()
            .lowercase()
            .trim(),

        password: Joi.string()
            .min(6)
            .max(128)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .message('Senha deve ter pelo menos 6 caracteres, incluindo maiúscula, minúscula e número'),

        username: Joi.string()
            .alphanum()
            .min(3)
            .max(30)
            .trim(),

        url: Joi.string()
            .uri()
            .trim(),

        date: Joi.date()
            .iso(),

        pagination: {
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(10),
            sortBy: Joi.string().default('createdAt'),
            sortOrder: Joi.string().valid('asc', 'desc').default('desc')
        },

        search: Joi.string()
            .trim()
            .min(1)
            .max(100),

        tag: Joi.string()
            .trim()
            .min(2)
            .max(50),

        area: Joi.string()
            .valid(
                'Teologia Sistemática',
                'Teologia Bíblica',
                'Comentários Bíblicos',
                'Vida Cristã',
                'Apologética',
                'História da Igreja',
                'Biografias',
                'Devocionais',
                'Outros'
            )
    };

    /**
     * Cria uma instância do DTO e valida os dados
     * @param {Object} data - Dados a serem validados
     * @returns {Object} - Resultado da validação
     */
    static validateAndCreate(data) {
        const instance = new this(data);
        const validation = instance.validate();

        if (!validation.isValid) {
            return {
                success: false,
                errors: validation.errors,
                instance: null
            };
        }

        return {
            success: true,
            data: validation.data,
            instance
        };
    }
}

module.exports = BaseDTO;
