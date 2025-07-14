// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifySecureToken, applySecurityHeaders } = require('./jwtSecurity');

// Importa DTO para respostas padronizadas - NOVO
const { ApiResponseDTO } = require('../dto');

/**
 * Middleware de autenticação e autorização
 * Protege rotas e verifica permissões de usuários
 */

// Aplica headers de segurança automaticamente
const addSecurityHeaders = applySecurityHeaders;

// ========== MIDDLEWARE DE AUTENTICAÇÃO ==========
const protect = async (req, res, next) => {
  let token;

  // Verifica se o token Bearer está presente no cabeçalho
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extrai o token (remove "Bearer " do início)
      token = req.headers.authorization.split(' ')[1];

      // Verifica e decodifica o token JWT usando sistema seguro
      const decoded = verifySecureToken(token, 'access');
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
    } catch (error) {
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
        ApiResponseDTO.error('Falha na autenticação', null, 401)
      );
    }
  }

  // Se não há token
  if (!token) {
    return res.status(401).json(
      ApiResponseDTO.error(
        'Acesso negado. Token de autenticação necessário',
        null,
        401
      )
    );
  }
};

// ========== MIDDLEWARE DE AUTORIZAÇÃO ==========
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Verifica se o usuário foi autenticado
    if (!req.user) {
      return res.status(401).json(
        ApiResponseDTO.error('Usuário não autenticado', null, 401)
      );
    }

    // Verifica se a role do usuário está nas roles permitidas
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        ApiResponseDTO.error(
          `Acesso negado. Permissão '${req.user.role}' insuficiente para esta operação`,
          [{ field: 'role', message: `Roles requeridas: ${roles.join(', ')}` }],
          403
        )
      );
    }

    next(); // Usuário autorizado, prossegue
  };
};

// ========== MIDDLEWARE OPCIONAL ==========
// Middleware que tenta autenticar mas não falha se não conseguir
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Ignora erros - middleware opcional
      req.user = null;
    }
  }

  next(); // Sempre prossegue, com ou sem usuário
};

module.exports = {
  protect,
  authorizeRoles,
  optionalAuth,
  addSecurityHeaders
};