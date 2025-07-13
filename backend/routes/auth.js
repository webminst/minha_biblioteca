// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateSecureToken, verifySecureToken, authRateLimit } = require('../middleware/jwtSecurity');

/**
 * Rotas de autenticação
 * Gerencia login e registro de usuários administrativos
 */

// Aplica rate limiting a todas as rotas de autenticação
router.use(authRateLimit);

// Função auxiliar para gerar JWT (DEPRECIADA - use generateSecureToken)
const generateToken = (id, role) => {
  console.warn('⚠️  generateToken depreciada. Use generateSecureToken.');
  return generateSecureToken({ id, role }, 'access');
};

// ========== ROTA DE REGISTRO ========== 
// POST /api/auth/register - Criar primeiro usuário admin
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Validação básica
    if (!username || !password) {
      return res.status(400).json({
        message: 'Username e senha são obrigatórios'
      });
    }

    // Verifica se usuário já existe
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({
        message: 'Nome de usuário já existe'
      });
    }

    // Cria novo usuário
    const user = await User.create({
      username,
      password, // Senha será hasheada automaticamente pelo schema
      role: role || 'admin'
    });

    // Gera tokens seguros para o novo usuário
    const accessToken = generateSecureToken({ id: user._id, role: user.role }, 'access');
    const refreshToken = generateSecureToken({ id: user._id, role: user.role }, 'refresh');

    // Retorna dados do usuário criado
    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token: accessToken,
      refreshToken: refreshToken,
      message: 'Usuário criado com sucesso',
      expiresIn: '15m'
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// ========== ROTA DE LOGIN ==========
// POST /api/auth/login - Autenticar usuário
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validação básica
    if (!username || !password) {
      return res.status(400).json({
        message: 'Username e senha são obrigatórios'
      });
    }

    // Busca usuário no banco
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        message: 'Credenciais inválidas'
      });
    }

    // Verifica senha usando método do schema
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Credenciais inválidas'
      });
    }

    // Login bem-sucedido - gera tokens seguros
    const accessToken = generateSecureToken({ id: user._id, role: user.role }, 'access');
    const refreshToken = generateSecureToken({ id: user._id, role: user.role }, 'refresh');

    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token: accessToken,
      refreshToken: refreshToken,
      message: 'Login realizado com sucesso',
      expiresIn: '15m' // Access token expira em 15 minutos
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// ========== ROTA DE VERIFICAÇÃO ==========
// POST /api/auth/verify - Verificar validade do token
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        message: 'Token não fornecido'
      });
    }

    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca usuário para confirmar que ainda existe
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        valid: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      valid: true,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    // Token inválido ou expirado
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        valid: false,
        message: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        valid: false,
        message: 'Token expirado'
      });
    }

    console.error('Erro na verificação:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// ========== ROTA DE REFRESH TOKEN ==========
// POST /api/auth/refresh - Renovar access token usando refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: 'Refresh token necessário'
      });
    }

    // Verifica o refresh token
    const decoded = verifySecureToken(refreshToken, 'refresh');

    // Busca o usuário para verificar se ainda existe
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        message: 'Usuário não encontrado'
      });
    }

    // Gera novo access token
    const newAccessToken = generateSecureToken({ id: user._id, role: user.role }, 'access');

    res.json({
      token: newAccessToken,
      expiresIn: '15m',
      message: 'Token renovado com sucesso'
    });

  } catch (error) {
    console.error('Erro no refresh token:', error);

    if (error.message.includes('Token')) {
      return res.status(401).json({
        message: 'Refresh token inválido ou expirado'
      });
    }

    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;