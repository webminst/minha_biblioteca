"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDTO = void 0;
const joi_1 = __importDefault(require("joi"));
class BaseDTO {
    constructor(data = {}) {
        this.errors = [];
        this.data = data;
    }
    /**
     * Valida os dados usando o schema Joi definido na classe filha
     */
    validate() {
        if (!this.schema) {
            throw new Error('Schema de validação não definido na classe DTO');
        }
        // Ajuste: se area for string separada por vírgula, converte para array
        if (typeof this.data.area === 'string' && this.data.area.includes(',')) {
            this.data.area = this.data.area.split(',').map((s) => s.trim());
        }
        const { error, value } = this.schema.validate(this.data, {
            abortEarly: false,
            stripUnknown: true,
            convert: true
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
     */
    transform() {
        return this.validatedData || this.data;
    }
    /**
     * Retorna apenas os campos seguros para exposição pública
     */
    toSafeObject() {
        const transformed = this.transform();
        // Remove campos sensíveis por padrão
        const { password, token, ...safeData } = transformed;
        return safeData;
    }
    /**
     * Cria uma instância do DTO e valida os dados
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
exports.BaseDTO = BaseDTO;
/**
 * Utilitário para criar validações comuns
 */
BaseDTO.commonValidations = {
    id: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .message('ID deve ser um ObjectId válido'),
    email: joi_1.default.string().email().lowercase().trim(),
    password: joi_1.default.string()
        .min(6)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .message('Senha deve ter pelo menos 6 caracteres, incluindo maiúscula, minúscula e número'),
    username: joi_1.default.string().alphanum().min(3).max(30).trim(),
    url: joi_1.default.string().uri().trim(),
    date: joi_1.default.date().iso(),
    pagination: {
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(10),
        sortBy: joi_1.default.string().default('createdAt'),
        sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc')
    },
    search: joi_1.default.string().trim().min(1).max(100),
    tag: joi_1.default.string().trim().min(2).max(50),
    area: joi_1.default.alternatives().try(joi_1.default.string().valid('Teologia Sistemática', 'Teologia Bíblica', 'Comentários Bíblicos', 'Vida Cristã', 'Apologética', 'História da Igreja', 'Biografias', 'Devocionais', 'Outros', 'Soteriologia', 'Apologética Cristã'), joi_1.default.array().items(joi_1.default.string().valid('Teologia Sistemática', 'Teologia Bíblica', 'Comentários Bíblicos', 'Vida Cristã', 'Apologética', 'História da Igreja', 'Biografias', 'Devocionais', 'Outros', 'Soteriologia', 'Apologética Cristã')))
};
