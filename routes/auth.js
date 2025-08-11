const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Login
router.post('/login', authController.login);

// Cadastro de novo proprietário (apenas para administradores do sistema)
router.post('/cadastrar-proprietario', authController.cadastrarProprietario);

module.exports = router;