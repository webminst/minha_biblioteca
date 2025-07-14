// middleware/dtoValidation.js
const { ApiResponseDTO } = require('../dto');

/**
 * Middleware para validação automática de DTOs
 * Integra validação de entrada e transformação de saída
 */

/**
 * Middleware para validar dados de entrada usando DTOs
 * @param {Class} DTOClass - Classe DTO para validação
 * @param {string} source - Fonte dos dados ('body', 'query', 'params')
 */
const validateInput = (DTOClass, source = 'body') => {
    return (req, res, next) => {
        try {
            // Obtém os dados da fonte especificada
            const data = req[source];

            // Valida usando o DTO
            const result = DTOClass.validateAndCreate(data);

            if (!result.success) {
                return res.status(400).json(
                    ApiResponseDTO.error(
                        'Dados de entrada inválidos',
                        result.errors,
                        400
                    )
                );
            }

            // Armazena os dados validados e transformados
            req.validatedData = result.data;
            req.dtoInstance = result.instance;

            next();
        } catch (error) {
            console.error('Erro na validação DTO:', error);
            return res.status(500).json(
                ApiResponseDTO.error(
                    'Erro interno na validação',
                    null,
                    500
                )
            );
        }
    };
};

/**
 * Middleware para transformar dados de saída usando DTOs
 * @param {Class} DTOClass - Classe DTO para transformação de resposta
 * @param {string} method - Método de transformação ('toPublicObject', 'toSummaryObject', etc.)
 */
const transformOutput = (DTOClass, method = 'toPublicObject') => {
    return (req, res, next) => {
        // Intercepta o método json do response
        const originalJson = res.json;

        res.json = function (data) {
            try {
                // Se os dados têm um array de items (listagem paginada)
                if (data && data.data && Array.isArray(data.data)) {
                    data.data = data.data.map(item => {
                        const dto = new DTOClass(item);
                        return dto[method] ? dto[method]() : dto.toSafeObject();
                    });
                }
                // Se é um único item
                else if (data && !data.success) {
                    const dto = new DTOClass(data);
                    data = dto[method] ? dto[method]() : dto.toSafeObject();
                }

                return originalJson.call(this, data);
            } catch (error) {
                console.error('Erro na transformação DTO:', error);
                return originalJson.call(this, data); // Retorna dados originais em caso de erro
            }
        };

        next();
    };
};

/**
 * Middleware combinado para validação de entrada e transformação de saída
 * @param {Object} options - Configurações
 * @param {Class} options.inputDTO - DTO para validação de entrada
 * @param {Class} options.outputDTO - DTO para transformação de saída
 * @param {string} options.inputSource - Fonte dos dados de entrada
 * @param {string} options.outputMethod - Método de transformação de saída
 */
const validateAndTransform = (options) => {
    const {
        inputDTO,
        outputDTO,
        inputSource = 'body',
        outputMethod = 'toPublicObject'
    } = options;

    const middlewares = [];

    // Adiciona validação de entrada se especificada
    if (inputDTO) {
        middlewares.push(validateInput(inputDTO, inputSource));
    }

    // Adiciona transformação de saída se especificada
    if (outputDTO) {
        middlewares.push(transformOutput(outputDTO, outputMethod));
    }

    return middlewares;
};

/**
 * Middleware para validar parâmetros de busca/paginação
 * @param {Class} SearchDTO - DTO de busca específico
 */
const validateSearch = (SearchDTO) => {
    return validateInput(SearchDTO, 'query');
};

/**
 * Middleware para validar IDs em parâmetros da URL
 */
const validateId = (req, res, next) => {
    try {
        const { MongoIdDTO } = require('../dto');

        if (req.params.id) {
            MongoIdDTO.validate(req.params.id);
            req.validatedId = req.params.id;
        }

        next();
    } catch (error) {
        return res.status(400).json(
            ApiResponseDTO.error(
                'ID inválido',
                [{ field: 'id', message: error.message }],
                400
            )
        );
    }
};

/**
 * Middleware para padronizar respostas de sucesso
 * @param {string} message - Mensagem de sucesso
 * @param {number} statusCode - Código de status HTTP
 */
const successResponse = (message = null, statusCode = 200) => {
    return (req, res, next) => {
        const originalJson = res.json;

        res.json = function (data) {
            // Se já é uma resposta padronizada, não altera
            if (data && typeof data.success === 'boolean') {
                res.status(statusCode);
                return originalJson.call(this, data);
            }

            // Cria resposta padronizada
            const response = ApiResponseDTO.success(data, message);
            res.status(statusCode);
            return originalJson.call(this, response);
        };

        next();
    };
};

/**
 * Middleware para tratar erros de validação automaticamente
 */
const handleValidationErrors = (error, req, res, next) => {
    // Erros de validação do Joi
    if (error.isJoi) {
        const errors = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
        }));

        return res.status(400).json(
            ApiResponseDTO.error(
                'Dados inválidos',
                errors,
                400
            )
        );
    }

    // Erros de cast do MongoDB (ID inválido)
    if (error.name === 'CastError') {
        return res.status(400).json(
            ApiResponseDTO.error(
                'ID inválido',
                [{ field: error.path, message: 'Formato de ID inválido' }],
                400
            )
        );
    }

    // Erros de validação do MongoDB
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message,
            value: err.value
        }));

        return res.status(400).json(
            ApiResponseDTO.error(
                'Erro de validação',
                errors,
                400
            )
        );
    }

    next(error);
};

module.exports = {
    validateInput,
    transformOutput,
    validateAndTransform,
    validateSearch,
    validateId,
    successResponse,
    handleValidationErrors
};
