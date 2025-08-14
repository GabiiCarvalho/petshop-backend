const { PlanoMensal, Pet, Cliente } = require('../models');

module.exports = {
  async criar(req, res) {
    try {
      const { lojaId } = req;
      const { pet_id, data_inicio, data_fim, banhos_inclusos, valor_total } = req.body;

      const pet = await Pet.findOne({ 
        where: { id: pet_id, loja_id: lojaId },
        include: [{ model: Cliente, as: 'Cliente' }]
      });

      if (!pet) {
        return res.status(404).json({ error: 'Pet não encontrado' });
      }

      const plano = await PlanoMensal.create({
        loja_id: lojaId,
        pet_id,
        cliente_id: pet.Cliente.id,
        data_inicio,
        data_fim,
        banhos_inclusos,
        tosas_inclusas: 1,
        valor_total,
        status: 'ativo'
      });

      // Atualiza o pet para indicar que tem plano
      await pet.update({ tem_plano: true });

      return res.status(201).json(plano);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar plano mensal' });
    }
  },

  async renovar(req, res) {
    try {
      const { lojaId } = req;
      const { plano_id } = req.params;
      const { data_fim, banhos_inclusos, valor_total } = req.body;

      const plano = await PlanoMensal.findOne({ 
        where: { id: plano_id, loja_id: lojaId }
      });

      if (!plano) {
        return res.status(404).json({ error: 'Plano não encontrado' });
      }

      // Cria um novo plano (renovação)
      const novoPlano = await PlanoMensal.create({
        loja_id: lojaId,
        pet_id: plano.pet_id,
        cliente_id: plano.cliente_id,
        data_inicio: new Date(),
        data_fim,
        banhos_inclusos,
        tosas_inclusas: 1,
        valor_total,
        status: 'ativo'
      });

      return res.status(201).json(novoPlano);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao renovar plano' });
    }
  },

  async listarPorCliente(req, res) {
    try {
      const { lojaId } = req;
      const { clienteId } = req.params;

      const planos = await PlanoMensal.findAll({
        where: { 
          cliente_id: clienteId,
          loja_id: lojaId 
        },
        include: [
          { model: Pet, as: 'Pet' },
          { model: Cliente, as: 'Cliente' }
        ],
        order: [['data_fim', 'DESC']]
      });

      return res.json(planos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar planos' });
    }
  }
};