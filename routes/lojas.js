const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const lojaMiddleware = require('../middlewares/loja');
const lojaController = require('../controllers/lojas');

// Listar todas as lojas (apenas admin)
router.get('/', authMiddleware, lojaController.listar);

// Obter detalhes de uma loja
router.get('/:lojaId', authMiddleware, lojaMiddleware, lojaController.obterPorId);

// Atualizar loja (apenas proprietário)
router.put('/:lojaId', authMiddleware, lojaMiddleware, lojaController.atualizar);

module.exports = router;