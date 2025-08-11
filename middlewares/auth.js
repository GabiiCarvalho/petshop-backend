const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userCargo = decoded.cargo;
    req.lojaId = decoded.loja_id;

    // Verifica se o usuário ainda existe no banco
    const user = await Usuario.findByPk(decoded.id);
    if (!user || !user.ativo) {
      return res.status(401).json({ error: 'Usuário inválido' });
    }

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar se o usuário é proprietário
module.exports.isProprietario = (req, res, next) => {
  if (req.userCargo !== 'proprietario') {
    return res.status(403).json({ error: 'Acesso restrito a proprietários' });
  }
  next();
};