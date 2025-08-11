const { Loja } = require('../models');

module.exports = async (req, res, next) => {
  // Se o usuário já tem loja_id (de token JWT), verifica se a loja existe
  if (req.lojaId) {
    try {
      const loja = await Loja.findByPk(req.lojaId);
      if (!loja || !loja.ativa) {
        return res.status(403).json({ error: 'Loja não encontrada ou inativa' });
      }
      return next();
    } catch (err) {
      return res.status(500).json({ error: 'Erro ao verificar loja' });
    }
  }
  
  // Para rotas que precisam especificar a loja no corpo/params
  const lojaId = req.params.lojaId || req.body.loja_id;
  if (!lojaId) {
    return res.status(400).json({ error: 'ID da loja não fornecido' });
  }

  try {
    const loja = await Loja.findByPk(lojaId);
    if (!loja || !loja.ativa) {
      return res.status(403).json({ error: 'Loja não encontrada ou inativa' });
    }
    req.lojaId = loja.id; // Adiciona ao request para uso posterior
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao verificar loja' });
  }
};