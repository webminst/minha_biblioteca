import Joi, { Schema } from 'joi';

/**
 * Classe base para Data Transfer Objects
 * Fornece funcionalidades comuns de validação e transformação
 */
export interface IBaseDTO {
    data: any;
    errors: Array<{ field: string; message: string; value?: any }>;
    validatedData?: any;
    schema?: Schema;
    validate(): { isValid: boolean; data?: any; errors?: any[] };
    transform(): any;
    toSafeObject(): any;
}

export class BaseDTO implements IBaseDTO {
    data: any;
    errors: Array<{ field: string; message: string; value?: any }> = [];
    validatedData?: any;
    schema?: Schema;

    constructor(data: any = {}) {
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
            this.data.area = this.data.area.split(',').map((s: string) => s.trim());
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
     * Utilitário para criar validações comuns
     */
    static commonValidations = {
        id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .message('ID deve ser um ObjectId válido'),
        email: Joi.string().email().lowercase().trim(),
        password: Joi.string()
            .min(6)
            .max(128)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .message('Senha deve ter pelo menos 6 caracteres, incluindo maiúscula, minúscula e número'),
        username: Joi.string().alphanum().min(3).max(30).trim(),
        url: Joi.string().uri().trim(),
        date: Joi.date().iso(),
        pagination: {
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(10),
            sortBy: Joi.string().default('createdAt'),
            sortOrder: Joi.string().valid('asc', 'desc').default('desc')
        },
        search: Joi.string().trim().min(1).max(100),
        tag: Joi.string().trim().min(2).max(50),
        area: Joi.alternatives().try(
            Joi.string().valid(
                'Teologia Sistemática',
                'Teologia Bíblica',
                'Comentários Bíblicos',
                'Vida Cristã',
                'Apologética',
                'História da Igreja',
                'Biografias',
                'Devocionais',
                'Outros',
                'Soteriologia',
                'Apologética Cristã'
            ),
            Joi.array().items(Joi.string().valid(
                'Teologia Sistemática',
                'Teologia Bíblica',
                'Comentários Bíblicos',
                'Vida Cristã',
                'Apologética',
                'História da Igreja',
                'Biografias',
                'Devocionais',
                'Outros',
                'Soteriologia',
                'Apologética Cristã'
            ))
        )
    };

    /**
     * Cria uma instância do DTO e valida os dados
     */
    static validateAndCreate<T extends typeof BaseDTO>(this: T, data: any) {
        const instance = new this(data) as InstanceType<T>;
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
