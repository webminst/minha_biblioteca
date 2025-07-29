// models/Sermon.js
const mongoose = require('mongoose');

/**
 * Schema para modelo de Livros/Resumos
 * Representa resumos de livros teológicos e cristãos
 */

const BookSchema = new mongoose.Schema({
  // ========== INFORMAÇÕES BÁSICAS ==========
  title: {
    type: String,
    required: [true, 'Título do livro é obrigatório'],
    trim: true,
    maxlength: [200, 'Título não pode exceder 200 caracteres']
  },

  author: {
    type: String,
    required: [true, 'Autor do livro é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome do autor não pode exceder 100 caracteres']
  },

  publisher: {
    type: String,
    required: false,
    trim: true,
    maxlength: [100, 'Nome da editora não pode exceder 100 caracteres']
  },

  // ========== CATEGORIZAÇÃO ==========
  area: {
    type: String,
    required: false,
    trim: true,
    enum: [
      'Teologia Sistemática',
      'Teologia Bíblica',
      'Comentários Bíblicos',
      'Vida Cristã',
      'Apologética',
      'História da Igreja',
      'Biografias',
      'Devocionais',
      'Outros'
    ]
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
    required: [true, 'Resumo do livro é obrigatório'],
    minlength: [100, 'Resumo deve ter pelo menos 100 caracteres']
  },

  // ========== RECURSOS VISUAIS ==========
  coverImageUrl: {
    type: String,
    required: false,
    validate: {
      validator: function (v) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i.test(v);
      },
      message: 'URL da capa deve ser uma URL válida de imagem'
    }
  },

  // ========== ARQUIVOS ==========
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

  // ========== METADADOS ==========
  type: {
    type: String,
    default: 'Resumo de Livro',
    required: true
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
  },

  // Avaliações por estrelas
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      stars: { type: Number, min: 1, max: 5, required: true },
      ratedAt: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

// ========== VALIDAÇÕES CUSTOMIZADAS ==========
// Limita o número de tags
function arrayLimit(val) {
  return val.length <= 10;
}

// ========== ÍNDICES PARA PERFORMANCE ==========
BookSchema.index({ title: 'text', author: 'text', content: 'text' });
BookSchema.index({ area: 1 });
BookSchema.index({ createdAt: -1 });

// ========== MÉTODOS DO SCHEMA ==========
// Método para obter resumo curto
BookSchema.methods.getShortSummary = function () {
  return this.description || this.content.substring(0, 150) + '...';
};


// Método estático para buscar por área única (string)
BookSchema.statics.findByArea = function (area) {
  if (typeof area === 'string' && area.trim() !== '') {
    return this.find({ area: area }).sort({ createdAt: -1 });
  } else {
    return this.find({}).sort({ createdAt: -1 });
  }
};

// ========== MIDDLEWARE ==========
// Remove campos vazios antes de salvar
BookSchema.pre('save', function (next) {
  // Remove tags vazias
  if (this.tags) {
    this.tags = this.tags.filter(tag => tag && tag.trim() !== '');
  }
  next();
});

module.exports = mongoose.models.Book || mongoose.model('Book', BookSchema);