const express = require('express');
const router = express.Router();

// Importar rotas
const authRoutes = require('./auth');
const usuarioRoutes = require('./usuarios');
const lojaRoutes = require('./lojas');
const clienteRoutes = require('./clientes');
const petRoutes = require('./pets');
const servicoRoutes = require('./servicos');
const agendamentoRoutes = require('./agendamentos');
const vendaRoutes = require('./vendas');
const dashboardRoutes = require('./dashboard');

// Rotas públicas
router.use('/auth', authRoutes);

// Rotas protegidas
router.use('/usuarios', usuarioRoutes);
router.use('/lojas', lojaRoutes);
router.use('/clientes', clienteRoutes);
router.use('/pets', petRoutes);
router.use('/servicos', servicoRoutes);
router.use('/agendamentos', agendamentoRoutes);
router.use('/vendas', vendaRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;