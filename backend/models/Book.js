// models/Sermon.js
const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true // Remove espaços em branco do início e fim
  },
  series: {
    type: String, // Nome da série de sermões, se aplicável 
    required: false, // Opcional, se o sermão fizer parte de uma série
    trim: true // Remove espaços em branco do início e fim
  },
  tags: {// Opcional, se o sermão tiver tags
    type: [String], // Array de strings para tags (ex: "Fé", "Graça")
    required: false, 
    trim: true // Remove espaços em branco do início e fim de cada tag
  },
  author: {// Quem pregou, se houver múltiplos
    type: String, 
    required: false, // Opcional, se o sermão tiver um pregador específico
    trim: true 
  },
  date: {
    type: Date,
    default: Date.now // Define a data atual por padrão
  },
  local: {
    type: String,
    required: false, // Local onde o sermão foi pregado
    trim: true // Remove espaços em branco do início e fim
  },
    area: {
    type: String,
    required: false, // Local onde o sermão foi pregado
    trim: true // Remove espaços em branco do início e fim
  },
  description: {
    type: String,
    required: false // Descrição pode ser opcional
  },
  content: {
    type: String, // Usar String para armazenar o texto completo
    required: false // Ou 'true' se todo sermão deve ter conteúdo textual
  },
  audioUrl: {
    type: String,
    required: false // Opcional, se o sermão tiver áudio
  },
  videoUrl: {
    type: String,
    required: false // Opcional, se o sermão tiver vídeo
  },
    imageUrl: {
    type: String,
    required: false // Opcional, se o sermão tiver vídeo
  },
  pdfUrl: {
    type: String,
    required: false // Opcional, se houver um PDF do sermão
  },
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);