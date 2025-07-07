// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware de autenticação e autorização
 * Protege rotas e verifica permissões de usuários
 */

// ========== MIDDLEWARE DE AUTENTICAÇÃO ==========
const protect = async (req, res, next) => {
  let token;

  // Verifica se o token Bearer está presente no cabeçalho
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extrai o token (remove "Bearer " do início)
      token = req.headers.authorization.split(' ')[1];

      // Verifica e decodifica o token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Busca o usuário e anexa à requisição (sem a senha)
      req.user = await User.findById(decoded.id).select('-password');

      // Verifica se usuário ainda existe e está ativo
      if (!req.user || !req.user.isActive) {
        return res.status(401).json({
          message: 'Token válido, mas usuário não encontrado ou inativo'
        });
      }

      next(); // Prossegue para próximo middleware/rota
    } catch (error) {
      console.error('Erro na verificação do token:', error);

      // Trata diferentes tipos de erro de token
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Token expirado'
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          message: 'Token inválido'
        });
      }

      return res.status(401).json({
        message: 'Falha na autenticação'
      });
    }
  }

  // Se não há token
  if (!token) {
    return res.status(401).json({
      message: 'Acesso negado. Token de autenticação necessário'
    });
  }
};

// ========== MIDDLEWARE DE AUTORIZAÇÃO ==========
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Verifica se o usuário foi autenticado
    if (!req.user) {
      return res.status(401).json({
        message: 'Usuário não autenticado'
      });
    }

    // Verifica se a role do usuário está nas roles permitidas
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Acesso negado. Permissão '${req.user.role}' insuficiente para esta operação`,
        requiredRoles: roles
      });
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
  optionalAuth
};