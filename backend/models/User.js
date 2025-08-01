// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Importa o bcrypt para criptografar a senha

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Garante que o username seja único
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: { // Pode ser útil para diferenciar administradores de outros usuários
    type: String,
    enum: ['admin', 'editor', 'viewer'], // Exemplo de roles
    default: 'admin', // Para o seu caso, pode ser sempre 'admin'
  },

  // ========== CAMPOS PARA 2FA ==========
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false,
    },
    secret: {
      type: String, // Secret TOTP criptografado
      default: null,
    },
    backupCodes: [{
      code: {
        type: String,
        required: true,
      },
      used: {
        type: Boolean,
        default: false,
      },
      usedAt: {
        type: Date,
        default: null,
      },
    }],
    setupAt: {
      type: Date,
      default: null,
    },
    lastVerified: {
      type: Date,
      default: null,
    },
  },
}, {
  timestamps: true,
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

// ========== MÉTODOS PARA 2FA ==========

/**
 * Verifica se 2FA está habilitado
 */
UserSchema.methods.isTwoFactorEnabled = function () {
  return this.twoFactorAuth.enabled;
};

/**
 * Obtém códigos de backup não utilizados
 */
UserSchema.methods.getAvailableBackupCodes = function () {
  return this.twoFactorAuth.backupCodes.filter(code => !code.used);
};

/**
 * Conta códigos de backup disponíveis
 */
UserSchema.methods.getBackupCodesCount = function () {
  return this.getAvailableBackupCodes().length;
};

//module.exports = mongoose.model('User', UserSchema);
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
