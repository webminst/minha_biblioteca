import { ApiResponseDTO } from '../dto';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para validação automática de DTOs
 * Integra validação de entrada e transformação de saída
 */

/**
 * Middleware para validar dados de entrada usando DTOs
 * @param DTOClass - Classe DTO para validação
 * @param source - Fonte dos dados ('body', 'query', 'params')
 */
export const validateInput = (DTOClass: any, source: string = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Obtém os dados da fonte especificada
            const data = (req as any)[source];
            console.log('=== DEBUG VALIDAÇÃO DTO ===');
            console.log('Classe DTO:', DTOClass.name);
            console.log('Dados recebidos:', JSON.stringify(data, null, 2));
            // Valida usando o DTO
            const result = DTOClass.validateAndCreate(data);
            if (!result.success) {
                console.log('❌ Validação falhou:');
                console.log('Erros:', JSON.stringify(result.errors, null, 2));
                res.status(400).json(
                    ApiResponseDTO.error(
                        'Dados de entrada inválidos',
                        result.errors,
                        400
                    )
                );
                return; // Garante que não chama next()
            }
            console.log('✅ Validação bem-sucedida');
            console.log('Dados validados:', JSON.stringify(result.data, null, 2));
            // Armazena os dados validados e transformados
            (req as any).validatedData = result.data;
            (req as any).dtoInstance = result.instance;
            next();
        } catch (error) {
            console.error('Erro na validação DTO:', error);
            res.status(500).json(
                ApiResponseDTO.error(
                    'Erro interno na validação',
                    null,
                    500
                )
            );
            return; // Garante que não chama next()
        }
    };
};

/**
 * Middleware para transformar dados de saída usando DTOs
 * @param DTOClass - Classe DTO para transformação de resposta
 * @param method - Método de transformação ('toPublicObject', 'toSummaryObject', etc.)
 */
export const transformOutput = (DTOClass: any, method: string = 'toPublicObject') => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Intercepta o método json do response
        const originalJson = res.json;
        res.json = function (data: any) {
            try {
                // Se os dados têm um array de items (listagem paginada)
                if (data && data.data && Array.isArray(data.data)) {
                    data.data = data.data.map((item: any) => {
                        const dto = new DTOClass(item);
                        return dto[method] ? dto[method]() : dto.toSafeObject();
                    });
                } else if (data && typeof data === 'object') {
                    const dto = new DTOClass(data);
                    data = dto[method] ? dto[method]() : dto.toSafeObject();
                }
            } catch (err) {
                console.error('Erro ao transformar resposta DTO:', err);
            }
            return originalJson.call(this, data);
        };
        next();
    };
};
