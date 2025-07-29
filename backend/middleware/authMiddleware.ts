import jwt from 'jsonwebtoken';
import User from '../models/User';
import { verifySecureToken, applySecurityHeaders } from './jwtSecurity';
import { ApiResponseDTO } from '../dto';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de autenticação e autorização
 * Protege rotas e verifica permissões de usuários
 */

// Aplica headers de segurança automaticamente
export const addSecurityHeaders = applySecurityHeaders;

// ========== MIDDLEWARE DE AUTENTICAÇÃO ==========
export const protect = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Verifica se o token Bearer está presente no cabeçalho
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extrai o token (remove "Bearer " do início)
            token = req.headers.authorization.split(' ')[1];

            // Verifica e decodifica o token JWT usando sistema seguro
            const decoded: any = verifySecureToken(token, 'access');
            console.log('🔑 Token decodificado:', { id: decoded.id, role: decoded.role, jti: decoded.jti?.substring(0, 8) + '...' });

            // Busca o usuário e anexa à requisição (sem a senha)
            req.user = await User.findById(decoded.id).select('-password');
            console.log('👤 Usuário encontrado:', req.user ? { id: req.user._id, username: req.user.username } : 'null');

            // Verifica se usuário ainda existe
            if (!req.user) {
                console.log('❌ Usuário não encontrado no banco de dados');
                return res.status(401).json(
                    ApiResponseDTO.error(
                        'Token válido, mas usuário não encontrado',
                        null,
                        401
                    )
                );
            }

            console.log('✅ Autenticação bem-sucedida');

            next(); // Prossegue para próximo middleware/rota
        } catch (error: any) {
            console.error('Erro na verificação do token:', error);

            // Trata diferentes tipos de erro de token
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json(
                    ApiResponseDTO.error('Token expirado', null, 401)
                );
            }

            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json(
                    ApiResponseDTO.error('Token inválido', null, 401)
                );
            }

            return res.status(401).json(
                ApiResponseDTO.error('Não autorizado', null, 401)
            );
        }
    } else {
        return res.status(401).json(
            ApiResponseDTO.error('Token não fornecido', null, 401)
        );
    }
};
