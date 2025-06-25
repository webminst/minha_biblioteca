// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Importa o modelo de usuário

const protect = async (req, res, next) => {
  let token;

  // Verifica se o token está no cabeçalho de autorização (Bearer Token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extrai o token do cabeçalho
      token = req.headers.authorization.split(' ')[1];

      // Verifica o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Encontra o usuário pelo ID do token e anexa ao objeto de requisição
      req.user = await User.findById(decoded.id).select('-password'); // Não retorna a senha hasheada
      next(); // Prossegue para a próxima função middleware ou rota
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Não autorizado, token falhou.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Não autorizado, nenhum token.' });
  }
};

// Middleware para verificar se o usuário tem uma role específica (ex: 'admin')
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Usuário com role '${req.user.role}' não tem permissão para acessar esta rota.` }); // 403 Forbidden
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };