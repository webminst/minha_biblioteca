// routes/sermons.js
const express = require('express');
const router = express.Router();
const Sermon = require('../models/Sermon'); // Importa o modelo Sermon

// Rota para CRIAR um novo sermão (POST)
router.post('/', async (req, res) => {
  try {
    const newSermon = new Sermon(req.body);
    const savedSermon = await newSermon.save();
    res.status(201).json(savedSermon); // 201 Created
  } catch (error) {
    res.status(400).json({ message: error.message }); // 400 Bad Request
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
    if (!sermon) return res.status(404).json({ message: 'Sermão não encontrado.' }); // 404 Not Found
    res.status(200).json(sermon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para ATUALIZAR um sermão pelo ID (PATCH/PUT)
router.patch('/:id', async (req, res) => { // PATCH é bom para atualizações parciais
  try {
    const updatedSermon = await Sermon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedSermon) return res.status(404).json({ message: 'Sermão não encontrado.' });
    res.status(200).json(updatedSermon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Rota para DELETAR um sermão pelo ID (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    const deletedSermon = await Sermon.findByIdAndDelete(req.params.id);
    if (!deletedSermon) return res.status(404).json({ message: 'Sermão não encontrado.' });
    res.status(200).json({ message: 'Sermão excluído com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;