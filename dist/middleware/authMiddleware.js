"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = exports.addSecurityHeaders = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwtSecurity_1 = require("./jwtSecurity");
const dto_1 = require("../dto");
/**
 * Middleware de autenticação e autorização
 * Protege rotas e verifica permissões de usuários
 */
// Aplica headers de segurança automaticamente
exports.addSecurityHeaders = jwtSecurity_1.applySecurityHeaders;
// ========== MIDDLEWARE DE AUTENTICAÇÃO ==========
const protect = async (req, res, next) => {
    let token;
    // Verifica se o token Bearer está presente no cabeçalho
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extrai o token (remove "Bearer " do início)
            token = req.headers.authorization.split(' ')[1];
            // Verifica e decodifica o token JWT usando sistema seguro
            const decoded = (0, jwtSecurity_1.verifySecureToken)(token, 'access');
            console.log('🔑 Token decodificado:', { id: decoded.id, role: decoded.role, jti: decoded.jti?.substring(0, 8) + '...' });
            // Busca o usuário e anexa à requisição (sem a senha)
            req.user = await User_1.default.findById(decoded.id).select('-password');
            console.log('👤 Usuário encontrado:', req.user ? { id: req.user._id, username: req.user.username } : 'null');
            // Verifica se usuário ainda existe
            if (!req.user) {
                console.log('❌ Usuário não encontrado no banco de dados');
                return res.status(401).json(dto_1.ApiResponseDTO.error('Token válido, mas usuário não encontrado', null, 401));
            }
            console.log('✅ Autenticação bem-sucedida');
            next(); // Prossegue para próximo middleware/rota
        }
        catch (error) {
            console.error('Erro na verificação do token:', error);
            // Trata diferentes tipos de erro de token
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json(dto_1.ApiResponseDTO.error('Token expirado', null, 401));
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json(dto_1.ApiResponseDTO.error('Token inválido', null, 401));
            }
            return res.status(401).json(dto_1.ApiResponseDTO.error('Não autorizado', null, 401));
        }
    }
    else {
        return res.status(401).json(dto_1.ApiResponseDTO.error('Token não fornecido', null, 401));
    }
};
exports.protect = protect;
