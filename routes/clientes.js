const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clientes');
const authMiddleware = require('../middlewares/auth');
const lojaMiddleware = require('../middlewares/loja');

// Listar clientes da loja
router.get('/', authMiddleware, lojaMiddleware, clienteController.listar);

// Criar novo cliente
router.post('/', authMiddleware, lojaMiddleware, clienteController.criar);

// Obter detalhes de um cliente
router.get('/:clienteId', authMiddleware, lojaMiddleware, clienteController.obterPorId);

// Atualizar cliente
router.put('/:clienteId', authMiddleware, lojaMiddleware, clienteController.atualizar);

// Buscar clientes por nome/telefone
router.get('/buscar/:termo', authMiddleware, lojaMiddleware, clienteController.buscar);

// Listar pets de um cliente
router.get('/:clienteId/pets', authMiddleware, lojaMiddleware, clienteController.listarPets);

module.exports = router;