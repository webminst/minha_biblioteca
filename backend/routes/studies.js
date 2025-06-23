// routes/studies.js
const express = require('express');
const router = express.Router();
const Study = require('../models/Study'); // Importa o modelo Study

// Rota para CRIAR um novo estudo (POST)
router.post('/', async (req, res) => {
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
    res.status(200).json(studies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para LER um estudo específico pelo ID (GET)
router.get('/:id', async (req, res) => {
  try {
    const study = await Study.findById(req.params.id);
    if (!study) return res.status(404).json({ message: 'Estudo não encontrado.' });
    res.status(200).json(study);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para ATUALIZAR um estudo pelo ID (PATCH/PUT)
router.patch('/:id', async (req, res) => {
  try {
    const updatedStudy = await Study.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStudy) return res.status(404).json({ message: 'Estudo não encontrado.' });
    res.status(200).json(updatedStudy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota para DELETAR um estudo pelo ID (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    const deletedStudy = await Study.findByIdAndDelete(req.params.id);
    if (!deletedStudy) return res.status(404).json({ message: 'Estudo não encontrado.' });
    res.status(200).json({ message: 'Estudo excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;