// routes/studies.js
const express = require('express');
const router = express.Router();
const Study = require('../models/Study');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

/**
 * Rotas para gerenciamento de estudos bíblicos
 * CRUD completo para estudos e materiais didáticos
 */

// ========== ROTAS PÚBLICAS ==========
// GET /api/studies - Lista todos os estudos
router.get('/', async (req, res) => {
  try {
    const studies = await Study.find()
      .sort({ createdAt: -1 }) // Mais recentes primeiro
      .select('title reference theme format description tags createdAt updatedAt');

    res.json(studies);
  } catch (error) {
    console.error('Erro ao buscar estudos:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/studies/latest - Busca o estudo mais recente
router.get('/latest', async (req, res) => {
  try {
    const latestStudy = await Study.findOne()
      .sort({ createdAt: -1 })
      .select('title reference theme format description');

    if (!latestStudy) {
      return res.status(404).json({
        message: 'Nenhum estudo encontrado'
      });
    }

    res.json(latestStudy);
  } catch (error) {
    console.error('Erro ao buscar último estudo:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/studies/:id - Busca estudo específico por ID
router.get('/:id', async (req, res) => {
  try {
    const study = await Study.findById(req.params.id);

    if (!study) {
      return res.status(404).json({
        message: 'Estudo não encontrado'
      });
    }

    res.json(study);
  } catch (error) {
    console.error('Erro ao buscar estudo:', error);

    // Erro de ID inválido
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'ID de estudo inválido'
      });
    }

    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// ========== ROTAS PROTEGIDAS (ADMIN/EDITOR) ==========
// POST /api/studies - Criar novo estudo
router.post('/', protect, authorizeRoles('admin', 'editor'), async (req, res) => {
  try {
    const newStudy = new Study({
      ...req.body,
      createdBy: req.user._id // Registra quem criou o estudo
    });

    const savedStudy = await newStudy.save();

    res.status(201).json({
      ...savedStudy.toObject(),
      message: 'Estudo criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar estudo:', error);

    // Erro de validação
    if (error.name === 'ValidationError') {
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

// PATCH /api/studies/:id - Atualizar estudo existente
router.patch('/:id', protect, authorizeRoles('admin', 'editor'), async (req, res) => {
  try {
    const updatedStudy = await Study.findByIdAndUpdate(
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

    if (!updatedStudy) {
      return res.status(404).json({
        message: 'Estudo não encontrado'
      });
    }

    res.json({
      ...updatedStudy.toObject(),
      message: 'Estudo atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar estudo:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'ID de estudo inválido'
      });
    }

    if (error.name === 'ValidationError') {
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
// DELETE /api/studies/:id - Deletar estudo
router.delete('/:id', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    const deletedStudy = await Study.findByIdAndDelete(req.params.id);

    if (!deletedStudy) {
      return res.status(404).json({
        message: 'Estudo não encontrado'
      });
    }

    res.json({
      message: 'Estudo excluído com sucesso',
      deletedStudy: {
        _id: deletedStudy._id,
        title: deletedStudy.title
      }
    });
  } catch (error) {
    console.error('Erro ao deletar estudo:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'ID de estudo inválido'
      });
    }

    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

// ========== ROTA DE BUSCA ==========
// GET /api/studies/search/:term - Buscar estudos por termo
router.get('/search/:term', async (req, res) => {
  try {
    const searchTerm = req.params.term;
    const studies = await Study.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { reference: { $regex: searchTerm, $options: 'i' } },
        { theme: { $regex: searchTerm, $options: 'i' } },
        { format: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    })
      .sort({ createdAt: -1 })
      .select('title reference theme format description tags createdAt');

    res.json({
      searchTerm,
      count: studies.length,
      studies
    });
  } catch (error) {
    console.error('Erro na busca de estudos:', error);
    res.status(500).json({
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;