const { Loja } = require('../models');

module.exports = {
  async listar(req, res) {
    // Apenas administradores do sistema podem listar todas as lojas
    const lojas = await Loja.findAll({
      where: { ativa: true },
      attributes: ['id', 'nome', 'telefone', 'email']
    });
    return res.json(lojas);
  },

  async obterPorId(req, res) {
    const { lojaId } = req.params;
    const loja = await Loja.findByPk(lojaId);

    if (!loja) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }

    // Verifica se o usuário tem permissão para acessar esta loja
    if (req.lojaId !== loja.id && req.userCargo !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    return res.json(loja);
  },

  async atualizar(req, res) {
    const { lojaId } = req.params;
    
    // Apenas proprietários da loja podem atualizá-la
    if (req.lojaId !== parseInt(lojaId)) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    const loja = await Loja.findByPk(lojaId);
    if (!loja) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }

    const { nome, endereco, telefone, email } = req.body;
    await loja.update({ nome, endereco, telefone, email });

    return res.json(loja);
  }
};