// routes/studies.js
const express = require('express');
const router = express.Router();
const Study = require('../models/Study'); // Importa o modelo Study
const User = require('../models/User');
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Adicione esta linha

// Rota para CRIAR um novo sermão (POST) - PROTEGIDA
router.post('/', protect, authorizeRoles('admin', 'editor'), async (req, res) => {
  try {
    const newStudy = new Study(req.body);
    const savedStudy = await newStudy.save();
    res.status(201).json(savedStudy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota para LER todos os estudos (GET)
router.get('/', async (req, res) => {
  try {
    const studies = await Study.find();
    res.json(studies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para LER o último estudo (GET)
router.get('/latest', async (req, res) => {
  try {
    const latestStudy = await Study.findOne().sort({ createdAt: -1 }); // Ordena por data de criação descrescente
    if (!latestStudy) return res.status(404).json({ message: 'Nenhum estudo encontrado' });
    res.status(200).json(latestStudy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para LER um estudo específico pelo ID (GET)
router.get('/:id', async (req, res) => {
  try {
    const study = await Study.findById(req.params.id);
    if (!study) return res.status(404).json({ message: 'Estudo não encontrado' });
    res.json(study);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para ATUALIZAR um sermão pelo ID (PATCH/PUT) - PROTEGIDA
router.patch('/:id', protect, authorizeRoles('admin', 'editor'), async (req, res) => {
  try {
    const updatedStudy = await Study.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStudy) return res.status(404).json({ message: 'Estudo não encontrado.' });
    res.status(200).json(updatedStudy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota para DELETAR um sermão pelo ID (DELETE) - PROTEGIDA
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => { // Apenas admin pode deletar
  try {
    const deletedStudy = await Study.findByIdAndDelete(req.params.id);
    if (!deletedStudy) return res.status(404).json({ message: 'Estudo não encontrado.' });
    res.status(200).json({ message: 'Estudo excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;