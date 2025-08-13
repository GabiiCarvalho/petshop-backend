const { Servico, AgendamentoItem } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  async listar(req, res) {
    try {
      const { lojaId } = req;
      const { ativo, pagina = 1, limite = 20 } = req.query;

      const where = { loja_id: lojaId };
      if (ativo) where.ativo = ativo === 'true';

      const servicos = await Servico.findAndCountAll({
        where,
        limit: parseInt(limite),
        offset: (pagina - 1) * limite,
        order: [['nome', 'ASC']]
      });

      res.json({
        total: servicos.count,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(servicos.count / limite),
        servicos: servicos.rows
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar serviços' });
    }
  },

  async cadastrar(req, res) {
    try {
      const { lojaId } = req;
      const servico = await Servico.create({
        ...req.body,
        loja_id: lojaId
      });

      res.status(201).json(servico);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao cadastrar serviço' });
    }
  },

  async obterPorId(req, res) {
    try {
      const { lojaId } = req;
      const { id } = req.params;

      const servico = await Servico.findOne({
        where: { id, loja_id: lojaId },
        include: [{
          model: AgendamentoItem,
          attributes: ['id', 'preco', 'createdAt'],
          limit: 10,
          order: [['createdAt', 'DESC']]
        }]
      });

      if (!servico) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      res.json(servico);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter serviço' });
    }
  },

  async atualizar(req, res) {
    try {
      const { lojaId } = req;
      const { id } = req.params;

      const servico = await Servico.findOne({ where: { id, loja_id: lojaId } });
      if (!servico) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      await servico.update(req.body);
      res.json(servico);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar serviço' });
    }
  },

  async atualizarStatus(req, res) {
    try {
      const { lojaId } = req;
      const { id } = req.params;
      const { ativo } = req.body;

      const servico = await Servico.findOne({ where: { id, loja_id: lojaId } });
      if (!servico) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      await servico.update({ ativo });
      res.json(servico);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar status do serviço' });
    }
  }
};