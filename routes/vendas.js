const express = require('express');
const router = express.Router();
const vendaController = require('../controllers/vendas');
const authMiddleware = require('../middlewares/auth');
const lojaMiddleware = require('../middlewares/loja');

// Listar vendas da loja
router.get('/', authMiddleware, lojaMiddleware, vendaController.listar);

// Criar nova venda
router.post('/', authMiddleware, lojaMiddleware, vendaController.criar);

// Obter detalhes de uma venda
router.get('/:vendaId', authMiddleware, lojaMiddleware, vendaController.obterPorId);

// Cancelar venda
router.delete('/:vendaId', authMiddleware, lojaMiddleware, vendaController.cancelar);

// Relatório de vendas por período
router.get('/relatorio/periodo', authMiddleware, lojaMiddleware, vendaController.relatorioPeriodo);

// Relatório de produtos mais vendidos
router.get('/relatorio/produtos', authMiddleware, lojaMiddleware, vendaController.relatorioProdutos);

// Relatório de serviços mais realizados
router.get('/relatorio/servicos', authMiddleware, lojaMiddleware, vendaController.relatorioServicos);

module.exports = router;