const express = require('express');
const router = express.Router();

// Importar todas as rotas
const authRoutes = require('./auth');
const lojaRoutes = require('./lojas');
const usuarioRoutes = require('./usuarios');
const clienteRoutes = require('./clientes');
const petRoutes = require('./pets');
const servicoRoutes = require('./servicos');
const agendamentoRoutes = require('./agendamentos');
const vendaRoutes = require('./vendas');

// Rotas públicas
router.use('/auth', authRoutes);

// Rotas autenticadas
router.use('/lojas', lojaRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/clientes', clienteRoutes);
router.use('/pets', petRoutes);
router.use('/servicos', servicoRoutes);
router.use('/agendamentos', agendamentoRoutes);
router.use('/vendas', vendaRoutes);

module.exports = router;