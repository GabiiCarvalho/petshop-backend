const { Pet, Cliente, Agendamento, PlanoMensal } = require('../models');
const { Op } = require('sequelize');

module.exports = {
  async listar(req, res) {
    try {
      const { lojaId } = req;
      const { clienteId, pagina = 1, limite = 20 } = req.query;

      const where = { loja_id: lojaId };
      if (clienteId) where.cliente_id = clienteId;

      const pets = await Pet.findAndCountAll({
        where,
        include: [
          { model: Cliente, attributes: ['id', 'nome'] },
          { model: PlanoMensal, where: { status: 'ativo' }, required: false }
        ],
        limit: parseInt(limite),
        offset: (pagina - 1) * limite,
        order: [['nome', 'ASC']]
      });

      res.json({
        total: pets.count,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(pets.count / limite),
        pets: pets.rows
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar pets' });
    }
  },

  async cadastrar(req, res) {
    try {
      const { lojaId } = req;
      const { cliente_id, ...dadosPet } = req.body;

      // Verifica se cliente pertence à loja
      const cliente = await Cliente.findOne({ 
        where: { id: cliente_id, loja_id: lojaId } 
      });
      if (!cliente) {
        return res.status(400).json({ error: 'Cliente não encontrado' });
      }

      const pet = await Pet.create({
        ...dadosPet,
        cliente_id,
        loja_id: lojaId
      });

      res.status(201).json(pet);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao cadastrar pet' });
    }
  },

  async obterPorId(req, res) {
    try {
      const { lojaId } = req;
      const { id } = req.params;

      const pet = await Pet.findOne({
        where: { id, loja_id: lojaId },
        include: [
          { model: Cliente, attributes: ['id', 'nome', 'telefone'] },
          { model: Agendamento, limit: 5, order: [['data_hora', 'DESC']] },
          { model: PlanoMensal, order: [['data_fim', 'DESC']] }
        ]
      });

      if (!pet) {
        return res.status(404).json({ error: 'Pet não encontrado' });
      }

      res.json(pet);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter pet' });
    }
  },

  async atualizar(req, res) {
    try {
      const { lojaId } = req;
      const { id } = req.params;

      const pet = await Pet.findOne({ where: { id, loja_id: lojaId } });
      if (!pet) {
        return res.status(404).json({ error: 'Pet não encontrado' });
      }

      await pet.update(req.body);
      res.json(pet);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar pet' });
    }
  },

  async uploadFoto(req, res) {
    try {
      const { lojaId } = req;
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada' });
      }

      const pet = await Pet.findOne({ where: { id, loja_id: lojaId } });
      if (!pet) {
        return res.status(404).json({ error: 'Pet não encontrado' });
      }

      // Aqui você pode usar um serviço como AWS S3 ou salvar localmente
      const fotoUrl = `/uploads/pets/${req.file.filename}`;
      await pet.update({ foto_url: fotoUrl });

      res.json({ fotoUrl });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao fazer upload da foto' });
    }
  }
};