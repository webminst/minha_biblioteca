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

// POST /api/sermons - Criar um novo sermão
router.post('/', async (req, res) => {
  const sermon = new Sermon({
    title: req.body.title,
    bibleReference: req.body.bibleReference,
    series: req.body.series,
    tags: req.body.tags,
    speaker: req.body.speaker,
    date: req.body.date,
    local: req.body.local,
    description: req.body.description,
    content: req.body.content,
    audioUrl: req.body.audioUrl,
    videoUrl: req.body.videoUrl,
    pdfUrl: req.body.pdfUrl,
  });
  try {
    const newSermon = await sermon.save();
    res.status(201).json(newSermon);
  } catch (err) {
    res.status(400).json({ message: err.message });
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

// PUT /api/sermons/:id - Atualizar um sermão
router.put('/:id', async (req, res) => {
  try {
    const sermon = await Sermon.findById(req.params.id);
    if (!sermon) return res.status(404).json({ message: 'Sermão não encontrado' });

    // Atualiza apenas os campos que foram enviados no body
    Object.keys(req.body).forEach(key => {
      sermon[key] = req.body[key];
    });

    const updatedSermon = await sermon.save();
    res.json(updatedSermon);
  } catch (err) {
    res.status(400).json({ message: err.message });
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

// DELETE /api/sermons/:id - Excluir um sermão
router.delete('/:id', async (req, res) => {
  try {
    const sermon = await Sermon.findById(req.params.id);
    if (!sermon) return res.status(404).json({ message: 'Sermão não encontrado' });

    await sermon.deleteOne(); // Use deleteOne() ou deleteMany()
    res.json({ message: 'Sermão excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;