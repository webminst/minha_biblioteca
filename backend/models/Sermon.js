// models/Sermon.js
const mongoose = require('mongoose');

/**
 * Schema para modelo de Sermões
 * Representa sermões pregados, esboços e materiais homiléticos
 */

const SermonSchema = new mongoose.Schema({
  // ========== INFORMAÇÕES BÁSICAS ==========
  title: {
    type: String,
    required: [true, 'Título do sermão é obrigatório'],
    trim: true,
    maxlength: [200, 'Título não pode exceder 200 caracteres'],
  },

  bibleReference: {
    type: String,
    required: [true, 'Referência bíblica é obrigatória'],
    trim: true,
    maxlength: [100, 'Referência bíblica não pode exceder 100 caracteres'],
  },

  // ========== CATEGORIZAÇÃO ==========
  series: {
    type: String,
    required: false,
    trim: true,
    maxlength: [100, 'Nome da série não pode exceder 100 caracteres'],
  },

  tags: {
    type: [String],
    required: false,
    validate: [arrayLimit, 'Máximo 10 tags permitidas'],
  },

  // ========== INFORMAÇÕES DO EVENTO ==========
  speaker: {
    type: String,
    required: true,
    default: 'Giovanni Guimarães',
    trim: true,
    maxlength: [100, 'Nome do pregador não pode exceder 100 caracteres'],
  },

  date: {
    type: Date,
    default: Date.now,
    required: true,
  },

  local: {
    type: String,
    required: false,
    trim: true,
    maxlength: [150, 'Local não pode exceder 150 caracteres'],
  },

  // ========== CONTEÚDO ==========
  description: {
    type: String,
    required: false,
    maxlength: [500, 'Descrição não pode exceder 500 caracteres'],
  },

  content: {
    type: String,
    required: [true, 'Conteúdo do sermão é obrigatório'],
    minlength: [100, 'Conteúdo deve ter pelo menos 100 caracteres'],
  },

  // ========== RECURSOS MULTIMÍDIA ==========
  audioUrl: {
    type: String,
    required: false,
    validate: {
      validator (v) {
        return !v || /^https?:\/\/.+\.(mp3|wav|m4a)$/i.test(v);
      },
      message: 'URL deve apontar para um arquivo de áudio válido',
    },
  },

  videoUrl: {
    type: String,
    required: false,
    validate: {
      validator (v) {
        return !v || /^https?:\/\/.+\.(mp4|avi|mov|youtube\.com|youtu\.be)/.test(v);
      },
      message: 'URL deve apontar para um vídeo válido ou YouTube',
    },
  },

  pdfUrl: {
    type: String,
    required: false,
    validate: {
      validator (v) {
        if (!v) return true; // Allow empty values

        // Accept direct PDF URLs
        if (/^https?:\/\/.+\.pdf$/i.test(v)) return true;

        // Accept Google Drive URLs
        if (/^https?:\/\/(drive\.google\.com|docs\.google\.com)/.test(v)) return true;

        // Accept Dropbox URLs
        if (/^https?:\/\/(www\.)?dropbox\.com/.test(v)) return true;

        // Accept OneDrive URLs
        if (/^https?:\/\/[^.]*\.sharepoint\.com/.test(v)) return true;

        return false;
      },
      message: 'URL deve apontar para um arquivo PDF válido ou serviço de compartilhamento (Google Drive, Dropbox, OneDrive)',
    },
  },

  // ========== METADADOS ==========
  type: {
    type: String,
    default: 'Sermão',
    required: true,
  },

  duration: {
    type: Number, // Duração em minutos
    required: false,
    min: [5, 'Duração mínima de 5 minutos'],
    max: [180, 'Duração máxima de 3 horas'],
  },

  // Campos de auditoria (preenchidos automaticamente)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },

  // Avaliações por estrelas
  ratings: [
    {
      deviceId: { type: String, required: [true, 'ID do dispositivo é obrigatório'] },
      stars: {
        type: Number,
        required: [true, 'Avaliação em estrelas é obrigatória'],
        min: [1, 'Avaliação mínima é 1 estrela'],
        max: [5, 'Avaliação máxima é 5 estrelas'],
      },
      ratedAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
}, {
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
});

// ========== VALIDAÇÕES CUSTOMIZADAS ==========
// Limita o número de tags
function arrayLimit(val) {
  return val.length <= 10;
}

// ========== ÍNDICES PARA PERFORMANCE ==========
SermonSchema.index({ title: 'text', bibleReference: 'text', content: 'text' });
SermonSchema.index({ series: 1 });
SermonSchema.index({ speaker: 1 });
SermonSchema.index({ date: -1 });
SermonSchema.index({ createdAt: -1 });

// ========== MÉTODOS DO SCHEMA ==========
// Método para obter resumo curto
SermonSchema.methods.getShortSummary = function () {
  return this.description || `${this.content.substring(0, 150)}...`;
};

// Método para verificar se tem recursos multimídia
SermonSchema.methods.hasMultimedia = function () {
  return !!(this.audioUrl || this.videoUrl || this.pdfUrl);
};

// Método estático para buscar por série
SermonSchema.statics.findBySeries = function (series) {
  return this.find({ series }).sort({ date: -1 });
};

// Método estático para buscar por pregador
SermonSchema.statics.findBySpeaker = function (speaker) {
  return this.find({ speaker }).sort({ date: -1 });
};

// ========== MIDDLEWARE ==========
// Remove campos vazios antes de salvar
SermonSchema.pre('save', function (next) {
  // Remove tags vazias
  if (this.tags) {
    this.tags = this.tags.filter(tag => tag && tag.trim() !== '');
  }

  next();
});

module.exports = mongoose.models.Sermon || mongoose.model('Sermon', SermonSchema);
