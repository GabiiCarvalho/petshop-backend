// routes/usuarios.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarios');
const authMiddleware = require('../middlewares/auth');
const lojaMiddleware = require('../middlewares/loja');

// Listar todos os usuários (apenas para desenvolvimento/teste) - CORRIGIDO
router.get('/user', authMiddleware, usuarioController.listarTodos);

// Listar usuários da loja (proprietário/gerente)
router.get('/', authMiddleware, lojaMiddleware, usuarioController.listar);

// Criar novo usuário (proprietário/gerente)
router.post('/', authMiddleware, lojaMiddleware, usuarioController.criar);

// Obter detalhes de um usuário
router.get('/:usuarioId', authMiddleware, lojaMiddleware, usuarioController.obterPorId);

// Atualizar usuário
router.put('/:usuarioId', authMiddleware, lojaMiddleware, usuarioController.atualizar);

// Desativar usuário
router.delete('/:usuarioId', authMiddleware, lojaMiddleware, usuarioController.desativar);

module.exports = router;