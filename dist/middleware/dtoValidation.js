"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformOutput = exports.validateInput = void 0;
const dto_1 = require("../dto");
/**
 * Middleware para validação automática de DTOs
 * Integra validação de entrada e transformação de saída
 */
/**
 * Middleware para validar dados de entrada usando DTOs
 * @param DTOClass - Classe DTO para validação
 * @param source - Fonte dos dados ('body', 'query', 'params')
 */
const validateInput = (DTOClass, source = 'body') => {
    return (req, res, next) => {
        try {
            // Obtém os dados da fonte especificada
            const data = req[source];
            console.log('=== DEBUG VALIDAÇÃO DTO ===');
            console.log('Classe DTO:', DTOClass.name);
            console.log('Dados recebidos:', JSON.stringify(data, null, 2));
            // Valida usando o DTO
            const result = DTOClass.validateAndCreate(data);
            if (!result.success) {
                console.log('❌ Validação falhou:');
                console.log('Erros:', JSON.stringify(result.errors, null, 2));
                res.status(400).json(dto_1.ApiResponseDTO.error('Dados de entrada inválidos', result.errors, 400));
                return; // Garante que não chama next()
            }
            console.log('✅ Validação bem-sucedida');
            console.log('Dados validados:', JSON.stringify(result.data, null, 2));
            // Armazena os dados validados e transformados
            req.validatedData = result.data;
            req.dtoInstance = result.instance;
            next();
        }
        catch (error) {
            console.error('Erro na validação DTO:', error);
            res.status(500).json(dto_1.ApiResponseDTO.error('Erro interno na validação', null, 500));
            return; // Garante que não chama next()
        }
    };
};
exports.validateInput = validateInput;
/**
 * Middleware para transformar dados de saída usando DTOs
 * @param DTOClass - Classe DTO para transformação de resposta
 * @param method - Método de transformação ('toPublicObject', 'toSummaryObject', etc.)
 */
const transformOutput = (DTOClass, method = 'toPublicObject') => {
    return (req, res, next) => {
        // Intercepta o método json do response
        const originalJson = res.json;
        res.json = function (data) {
            try {
                // Se os dados têm um array de items (listagem paginada)
                if (data && data.data && Array.isArray(data.data)) {
                    data.data = data.data.map((item) => {
                        const dto = new DTOClass(item);
                        return dto[method] ? dto[method]() : dto.toSafeObject();
                    });
                }
                else if (data && typeof data === 'object') {
                    const dto = new DTOClass(data);
                    data = dto[method] ? dto[method]() : dto.toSafeObject();
                }
            }
            catch (err) {
                console.error('Erro ao transformar resposta DTO:', err);
            }
            return originalJson.call(this, data);
        };
        next();
    };
};
exports.transformOutput = transformOutput;
