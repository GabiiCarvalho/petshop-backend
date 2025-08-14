const express = require('express');
const router = express.Router();
const planoController = require('../controllers/planoMensal');
const authMiddleware = require('../middlewares/auth');
const lojaMiddleware = require('../middlewares/loja');

router.post('/', authMiddleware, lojaMiddleware, planoController.criar);
router.post('/:plano_id/renovar', authMiddleware, lojaMiddleware, planoController.renovar);
router.get('/cliente/:clienteId', authMiddleware, lojaMiddleware, planoController.listarPorCliente);

module.exports = router;

// routes/agendamentos.js (adição da nova rota)
router.post('/:agendamentoId/usar-plano', authMiddleware, lojaMiddleware, agendamentoController.usarPlanoMensal);