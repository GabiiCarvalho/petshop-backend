const express = require('express');
const router = express.Router();
const petController = require('../controllers/pets');
const authMiddleware = require('../middlewares/auth');
const lojaMiddleware = require('../middlewares/loja');

// Listar pets da loja
router.get('/', authMiddleware, lojaMiddleware, petController.listar);

// Criar novo pet
router.post('/', authMiddleware, lojaMiddleware, petController.criar);

// Obter detalhes de um pet
router.get('/:petId', authMiddleware, lojaMiddleware, petController.obterPorId);

// Atualizar pet
router.put('/:petId', authMiddleware, lojaMiddleware, petController.atualizar);

// Upload de foto do pet
router.post('/:petId/foto', authMiddleware, lojaMiddleware, petController.uploadFoto);

// Listar agendamentos do pet
router.get('/:petId/agendamentos', authMiddleware, lojaMiddleware, petController.listarAgendamentos);

// Listar planos do pet
router.get('/:petId/planos', authMiddleware, lojaMiddleware, petController.listarPlanos);

module.exports = router;