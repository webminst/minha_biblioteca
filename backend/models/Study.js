// models/Study.js
const mongoose = require('mongoose');

/**
 * Schema para modelo de Estudos Bíblicos
 * Representa estudos, materiais didáticos e recursos de ensino bíblico
 */

const StudySchema = new mongoose.Schema({
  // ========== INFORMAÇÕES BÁSICAS ==========
  title: {
    type: String,
    required: [true, 'Título do estudo é obrigatório'],
    trim: true,
    maxlength: [200, 'Título não pode exceder 200 caracteres']
  },

  reference: {
    type: String,
    required: [true, 'Referência bíblica é obrigatória'],
    trim: true,
    maxlength: [100, 'Referência bíblica não pode exceder 100 caracteres']
  },

  // ========== CATEGORIZAÇÃO ========== 
  theme: {
    type: String,
    required: false,
    trim: true
    // Aceita qualquer string, alinhado ao DTO/frontend
  },

  format: {
    type: String,
    required: false,
    trim: true
    // Aceita qualquer string, alinhado ao DTO/frontend
  },

  tags: {
    type: [String],
    required: false,
    validate: [arrayLimit, 'Máximo 10 tags permitidas']
  },

  // ========== CONTEÚDO ==========
  description: {
    type: String,
    required: false,
    maxlength: [500, 'Descrição não pode exceder 500 caracteres']
  },

  content: {
    type: String,
    required: [true, 'Conteúdo do estudo é obrigatório'],
    minlength: [100, 'Conteúdo deve ter pelo menos 100 caracteres']
  },

  // ========== ESTRUTURA DO ESTUDO ==========
  outline: {
    type: String,
    required: false,
    maxlength: [1000, 'Esboço não pode exceder 1000 caracteres']
  },

  questions: {
    type: [Object],
    required: false,
    validate: [questionsLimit, 'Máximo 20 perguntas permitidas']
    // Aceita array de objetos, alinhado ao DTO/frontend
  },

  // ========== RECURSOS ==========
  imageUrl: {
    type: String,
    required: false,
    validate: {
      validator: function (v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(v);
      },
      message: 'URL da imagem deve ser uma URL válida'
    }
  },

  pdfUrl: {
    type: String,
    required: false,
    validate: {
      validator: function (v) {
        return !v || /^https?:\/\/.+/i.test(v);
      },
      message: 'URL deve ser uma URL válida'
    }
  },

  // ========== AVALIAÇÕES ==========
  ratings: [
    {
      deviceId: { type: String, required: [true, 'ID do dispositivo é obrigatório'] },
      stars: { 
        type: Number, 
        required: [true, 'Avaliação em estrelas é obrigatória'],
        min: [1, 'Avaliação mínima é 1 estrela'],
        max: [5, 'Avaliação máxima é 5 estrelas']
      },
      ratedAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    }
  ],

  // ========== METADADOS ==========
  type: {
    type: String,
    required: false,
    trim: true
    // Aceita qualquer string, alinhado ao DTO/frontend
  },

  difficulty: {
    type: String,
    enum: ['Iniciante', 'Intermediário', 'Avançado'],
    default: 'Intermediário'
  },

  duration: {
    type: Number, // Duração em minutos
    required: false,
    min: [10, 'Duração mínima de 10 minutos'],
    max: [300, 'Duração máxima de 5 horas']
  },

  // Campos de auditoria (preenchidos automaticamente)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

// ========== VALIDAÇÕES CUSTOMIZADAS ==========
// Limita o número de tags
function arrayLimit(val) {
  return val.length <= 10;
}

// Limita o número de perguntas
function questionsLimit(val) {
  return val.length <= 20;
}

// ========== ÍNDICES PARA PERFORMANCE ==========
StudySchema.index({ title: 'text', reference: 'text', content: 'text' });
StudySchema.index({ theme: 1 });
StudySchema.index({ format: 1 });
StudySchema.index({ difficulty: 1 });
StudySchema.index({ createdAt: -1 });

// ========== MÉTODOS DO SCHEMA ==========
// Método para obter resumo curto
StudySchema.methods.getShortSummary = function () {
  return this.description || this.content.substring(0, 150) + '...';
};

// Método para contar perguntas
StudySchema.methods.getQuestionsCount = function () {
  return this.questions ? this.questions.length : 0;
};

// Método estático para buscar por tema
StudySchema.statics.findByTheme = function (theme) {
  return this.find({ theme: theme }).sort({ createdAt: -1 });
};

// Método estático para buscar por dificuldade
StudySchema.statics.findByDifficulty = function (difficulty) {
  return this.find({ difficulty: difficulty }).sort({ createdAt: -1 });
};

// ========== MIDDLEWARE ==========
// Remove campos vazios antes de salvar
StudySchema.pre('save', function (next) {
  // Remove tags vazias
  if (this.tags) {
    this.tags = this.tags.filter(tag => tag && tag.trim() !== '');
  }

  // Remove perguntas vazias
  if (this.questions) {
    this.questions = this.questions.filter(question => question && question.trim() !== '');
  }

  next();
});

module.exports = mongoose.models.Study || mongoose.model('Study', StudySchema);