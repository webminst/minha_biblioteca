// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // Importa o jsonwebtoken

// Função auxiliar para gerar JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '1h', // Token expira em 1 hora
  });
};

// Rota de Registro de Usuário (OPCIONAL: para criar seu primeiro admin)
// Você pode remover ou proteger essa rota após criar o primeiro usuário.
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Nome de usuário já existe.' });
    }

    const user = await User.create({
      username,
      password, // A senha será hasheada pelo middleware do schema
      role: role || 'admin', // Se não for fornecido, será admin por padrão
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Dados de usuário inválidos.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota de Login de Usuário
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Credenciais inválidas.' }); // 401 Unauthorized
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;