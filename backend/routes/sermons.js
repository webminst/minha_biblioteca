// routes/sermons.js
const express = require('express');
const router = express.Router();
const Sermon = require('../models/Sermon'); // Importa o modelo Sermon
const { protect, authorizeRoles } = require('../middleware/authMiddleware'); // Adicione esta linha

// Rota para CRIAR um novo sermão (POST)
// Rota para CRIAR um novo sermão (POST) - PROTEGIDA
router.post('/', protect, authorizeRoles('admin', 'editor'), async (req, res) => {
  try {
    const newSermon = new Sermon({ ...req.body, createdBy: req.user._id }); // Opcional: registrar quem criou
    const savedSermon = await newSermon.save();
    res.status(201).json(savedSermon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota para LER todos os sermões (GET)
router.get('/', async (req, res) => {
  try {
    const sermons = await Sermon.find();
    res.status(200).json(sermons); // 200 OK
  } catch (error) {
    res.status(500).json({ message: error.message }); // 500 Internal Server Error
  }
});

// Rota para LER o último sermão (GET)
router.get('/latest', async (req, res) => {
  try {
    const latestSermon = await Sermon.findOne().sort({ createdAt: -1 }); // Ordena por data de criação descrescente
    if (!latestSermon) return res.status(404).json({ message: 'Nenhum sermão encontrado' });
    res.status(200).json(latestSermon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para LER um sermão específico pelo ID (GET)
router.get('/:id', async (req, res) => {
  try {
    const sermon = await Sermon.findById(req.params.id);
    if (!sermon) return res.status(404).json({ message: 'Sermão não encontrado' });
    res.json(sermon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rota para ATUALIZAR um sermão pelo ID (PATCH/PUT) - PROTEGIDA
router.patch('/:id', protect, authorizeRoles('admin', 'editor'), async (req, res) => {
  try {
    const updatedSermon = await Sermon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSermon) return res.status(404).json({ message: 'Sermão não encontrado.' });
    res.status(200).json(updatedSermon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota para DELETAR um sermão pelo ID (DELETE) - PROTEGIDA
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => { // Apenas admin pode deletar
  try {
    const deletedSermon = await Sermon.findByIdAndDelete(req.params.id);
    if (!deletedSermon) return res.status(404).json({ message: 'Sermão não encontrado.' });
    res.status(200).json({ message: 'Sermão excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;