const express = require('express');
const router = express.Router();

// Importar apenas auth routes para teste
const authRoutes = require('./auth');

// Rotas públicas
router.use('/auth', authRoutes);

// Rotas placeholder para as outras (evitar erro 404)
router.use('/lojas', (req, res) => res.json({ message: 'Lojas placeholder' }));
router.use('/usuarios', (req, res) => res.json({ message: 'Usuarios placeholder' }));
router.use('/clientes', (req, res) => res.json({ message: 'Clientes placeholder' }));
router.use('/pets', (req, res) => res.json({ message: 'Pets placeholder' }));
router.use('/servicos', (req, res) => res.json({ message: 'Servicos placeholder' }));
router.use('/agendamentos', (req, res) => res.json({ message: 'Agendamentos placeholder' }));
router.use('/vendas', (req, res) => res.json({ message: 'Vendas placeholder' }));

module.exports = router;