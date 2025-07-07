// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Importa o bcrypt para criptografar a senha

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Garante que o username seja único
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: { // Pode ser útil para diferenciar administradores de outros usuários
    type: String,
    enum: ['admin', 'editor', 'viewer'], // Exemplo de roles
    default: 'admin' // Para o seu caso, pode ser sempre 'admin'
  }
}, {
  timestamps: true
});

// Middleware do Mongoose: executa ANTES de salvar o usuário
UserSchema.pre('save', async function (next) {
  // Apenas hash a senha se ela foi modificada (ou é um novo usuário)
  if (!this.isModified('password')) {
    return next();
  }
  // Gera um salt (string aleatória) e hasheia a senha
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar a senha fornecida com a senha hasheada
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//module.exports = mongoose.model('User', UserSchema);
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);