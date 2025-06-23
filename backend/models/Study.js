// models/Study.js
const mongoose = require('mongoose');

const StudySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true // Remove espaços em branco do início e fim
  },
    theme: {
    type: String,
    required: true,
    trim: true // Remove espaços em branco do início e fim
  },
    format: { // Formato do estudo (ex: "Congresso", "Palestra", "Estudo")
    type: String,
    required: true,
    trim: true // Remove espaços em branco do início e fim
  },
  bibleReference: {
    type: String,
    required: true,
    trim: true
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
  speaker: {// Quem ministrou o estudo
    type: String, 
    required: true, // Opcional, se o sermão tiver um pregador específico
    default: 'Giovanni Guimarães', // Valor padrão se não for fornecido
    trim: false 
  },
  date: {
    type: Date, // Data do estudo
    default: Date.now // Define a data atual por padrão
  },
  local: {
    type: String,
    required: false, // Local onde o sermão foi pregado
    trim: true // Remove espaços em branco do início e fim
  },
  description: {
    type: String, // resumo para apresentração do estudo 
    trim: false, // Remove espaços em branco do início e fim
    required: false // Descrição pode ser opcional
  },
  content: {
    type: String, // Usar String para armazenar o texto completo
    required: true // Ou 'true' se todo sermão deve ter conteúdo textual
  },
  audioUrl: {
    type: String,
    required: false // Opcional, se o sermão tiver áudio
  },
  videoUrl: {
    type: String,
    required: false // Opcional, se o sermão tiver vídeo
  },
  pdfUrl: {
    type: String,
    required: false // Opcional, se houver um PDF do sermão
  },
}, { timestamps: true });

module.exports = mongoose.model('Study', StudySchema);