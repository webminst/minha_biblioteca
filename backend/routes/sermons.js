// routes/sermons.js
const express = require('express');
const router = express.Router();
const Sermon = require('../models/Sermon');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * Rotas para gerenciamento de sermões
 * CRUD completo para sermões e esboços bíblicos
 */

// ========== ROTAS PÚBLICAS ==========
// GET /api/sermons/count - Conta total de sermões
router.get('/count', async (req, res) => {
  try {
    const count = await Sermon.countDocuments();
    res.json({ count });
  } catch (error) {
    console.error('Erro ao contar sermões:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/sermons - Lista todos os sermões
router.get('/', async (req, res) => {
  try {
    const sermons = await Sermon.find()
      .sort({ date: -1 }) // Por data, mais recentes primeiro
      .select('title bibleReference series description tags date createdAt updatedAt');

    res.json(sermons);
  } catch (error) {
    console.error('Erro ao buscar sermões:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/sermons/latest - Busca o sermão mais recente
router.get('/latest', async (req, res) => {
  try {
    const latestSermon = await Sermon.findOne()
      .sort({ createdAt: -1 }) // Mais recente por data de criação
      .select('title bibleReference series description date');

    if (!latestSermon) {
      return res.status(404).json({
        message: 'Nenhum sermão encontrado'
      });
    }

    res.json(latestSermon);
  } catch (error) {
    console.error('Erro ao buscar último sermão:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/sermons/:id - Busca sermão específico por ID
router.get('/:id', async (req, res) => {
  try {
    const sermon = await Sermon.findById(req.params.id);

    if (!sermon) {
      return res.status(404).json({
        message: 'Sermão não encontrado'
      });
    }

    res.json(sermon);
  } catch (error) {
    console.error('Erro ao buscar sermão:', error);

    // Erro de ID inválido
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'ID de sermão inválido'
      });
    }

    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// ========== ROTAS PROTEGIDAS (ADMIN/EDITOR) ==========
// POST /api/sermons - Criar novo sermão
router.post('/', protect, authorizeRoles('admin', 'editor'), async (req, res) => {
  try {
    const newSermon = new Sermon({
      ...req.body,
      createdBy: req.user._id // Registra quem criou o sermão
    });

    const savedSermon = await newSermon.save();

    res.status(201).json({
      ...savedSermon.toObject(),
      message: 'Sermão criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar sermão:', error);
    console.log('📝 Dados recebidos:', JSON.stringify(req.body, null, 2));

    // Erro de validação
    if (error.name === 'ValidationError') {
      console.log('❌ Erros de validação:', error.errors);
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// PATCH /api/sermons/:id - Atualizar sermão existente
router.patch('/:id', protect, authorizeRoles('admin', 'editor'), async (req, res) => {
  try {
    const updatedSermon = await Sermon.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user._id, // Registra quem atualizou
        updatedAt: new Date()
      },
      {
        new: true, // Retorna documento atualizado
        runValidators: true // Executa validações do schema
      }
    );

    if (!updatedSermon) {
      return res.status(404).json({
        message: 'Sermão não encontrado'
      });
    }

    res.json({
      ...updatedSermon.toObject(),
      message: 'Sermão atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar sermão:', error);
    console.log('📝 Dados de atualização recebidos:', JSON.stringify(req.body, null, 2));

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'ID de sermão inválido'
      });
    }

    if (error.name === 'ValidationError') {
      console.log('❌ Erros de validação na atualização:', error.errors);
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// ========== ROTAS PROTEGIDAS (APENAS ADMIN) ==========
// DELETE /api/sermons/:id - Deletar sermão
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const deletedSermon = await Sermon.findByIdAndDelete(req.params.id);

    if (!deletedSermon) {
      return res.status(404).json({
        message: 'Sermão não encontrado'
      });
    }

    res.json({
      message: 'Sermão excluído com sucesso',
      deletedSermon: {
        _id: deletedSermon._id,
        title: deletedSermon.title
      }
    });
  } catch (error) {
    console.error('Erro ao deletar sermão:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'ID de sermão inválido'
      });
    }

    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// ========== ROTA DE BUSCA ==========
// GET /api/sermons/search/:term - Buscar sermões por termo
router.get('/search/:term', async (req, res) => {
  try {
    const searchTerm = req.params.term;
    const sermons = await Sermon.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { bibleReference: { $regex: searchTerm, $options: 'i' } },
        { series: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    })
      .sort({ date: -1 })
      .select('title bibleReference series description tags date createdAt');

    res.json({
      searchTerm,
      count: sermons.length,
      sermons
    });
  } catch (error) {
    console.error('Erro na busca de sermões:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;