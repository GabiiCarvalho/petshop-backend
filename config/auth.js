require('dotenv').config();
const jwt = require('jsonwebtoken');
const { secret } = require('../config/database');
const { Usuario } = require('../models');

module.exports = {
  // Configurações JWT
  jwtConfig: {
    secret: process.env.JWT_SECRET || 'segredo_para_desenvolvimento',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // Middleware de autenticação
  authMiddleware: async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Erro no token' });
    }

    const [scheme, token] = parts;
    
    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verifica se o usuário ainda existe no banco
      const user = await Usuario.findByPk(decoded.id, {
        attributes: { exclude: ['senha_hash'] },
        include: [{ association: 'Loja' }]
      });

      if (!user || !user.ativo) {
        return res.status(401).json({ error: 'Usuário inválido' });
      }

      // Adiciona informações do usuário ao request
      req.userId = decoded.id;
      req.userCargo = decoded.cargo;
      req.lojaId = decoded.loja_id;
      req.user = user;

      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido', details: err.message });
    }
  },

  // Middleware para verificar cargo específico
  checkCargo: (...cargos) => {
    return (req, res, next) => {
      if (!cargos.includes(req.userCargo)) {
        return res.status(403).json({ 
          error: `Acesso restrito a: ${cargos.join(', ')}` 
        });
      }
      next();
    };
  },

  // Middleware para verificar se é dono ou gerente da loja
  checkLojaAccess: (req, res, next) => {
    if (req.userCargo === 'proprietario' || req.userCargo === 'gerente') {
      return next();
    }
    return res.status(403).json({ error: 'Acesso restrito a proprietários e gerentes' });
  },

  // Gerador de token
  generateToken: (user) => {
    return jwt.sign(
      { 
        id: user.id, 
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        loja_id: user.loja_id 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  },

  // Verificador de senha
  checkPassword: async (password, hash) => {
    return await bcrypt.compare(password, hash);
  },

  // Hash de senha
  hashPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
};