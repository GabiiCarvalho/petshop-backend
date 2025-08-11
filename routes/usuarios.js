const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarios');
const authMiddleware = require('../middlewares/auth');
const lojaMiddleware = require('../middlewares/loja');

// Listar usuários da loja (proprietário/gerente)
router.get('/', authMiddleware, lojaMiddleware, usuarioController.listar);

// Criar novo usuário (proprietário/gerente)
router.post('/', authMiddleware, lojaMiddleware, usuarioController.criar);

// Obter detalhes de um usuário
router.get('/:usuarioId', authMiddleware, lojaMiddleware, usuarioController.obterPorId);

// Atualizar usuário (proprietário pode atualizar qualquer um, gerente apenas funcionários)
router.put('/:usuarioId', authMiddleware, lojaMiddleware, usuarioController.atualizar);

// Desativar usuário
router.delete('/:usuarioId', authMiddleware, lojaMiddleware, usuarioController.desativar);

// Rotas específicas para proprietário
router.post('/:usuarioId/promover-gerente', 
  authMiddleware, 
  lojaMiddleware, 
  usuarioController.promoverGerente
);

module.exports = router;