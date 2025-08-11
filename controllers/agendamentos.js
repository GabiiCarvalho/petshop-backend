const { Agendamento, Pet, Cliente, Usuario, Servico, AgendamentoItem } = require('../models');

module.exports = {
  async criar(req, res) {
    const { loja_id, pet_id, cliente_id, data_hora, servicos, observacoes } = req.body;

    // Verifica se o pet e cliente pertencem à loja
    const pet = await Pet.findOne({ where: { id: pet_id, loja_id } });
    if (!pet) {
      return res.status(400).json({ error: 'Pet não encontrado nesta loja' });
    }

    const cliente = await Cliente.findOne({ where: { id: cliente_id, loja_id } });
    if (!cliente) {
      return res.status(400).json({ error: 'Cliente não encontrado nesta loja' });
    }

    // Calcula a data/hora final baseada nos serviços
    let data_hora_fim = new Date(data_hora);
    let totalServicos = 0;

    // Verifica cada serviço
    for (const servicoReq of servicos) {
      const servico = await Servico.findOne({ 
        where: { id: servicoReq.servico_id, loja_id } 
      });
      
      if (!servico) {
        return res.status(400).json({ 
          error: `Serviço ID ${servicoReq.servico_id} não encontrado` 
        });
      }

      data_hora_fim = new Date(data_hora_fim.getTime() + servico.duracao_minutos * 60000);
      totalServicos += servico.preco;
    }

    // Cria o agendamento
    const agendamento = await Agendamento.create({
      loja_id,
      pet_id,
      cliente_id,
      usuario_id: req.userId,
      data_hora,
      data_hora_fim,
      status: 'agendado',
      observacoes
    });

    // Cria os itens do agendamento
    const itens = [];
    for (const servicoReq of servicos) {
      const servico = await Servico.findByPk(servicoReq.servico_id);
      
      const item = await AgendamentoItem.create({
        agendamento_id: agendamento.id,
        servico_id: servico.id,
        nome_servico: servico.nome,
        descricao_servico: servico.descricao,
        preco: servico.preco,
        usando_plano: servicoReq.usando_plano || false,
        observacoes: servicoReq.observacoes
      });
      
      itens.push(item);
    }

    return res.status(201).json({
      agendamento,
      servicos: itens,
      total: totalServicos
    });
  },

  async listarPorLoja(req, res) {
    const { lojaId } = req.params;
    const { data_inicio, data_fim, status } = req.query;

    const where = { loja_id: lojaId };
    
    if (status) {
      where.status = status;
    }

    if (data_inicio && data_fim) {
      where.data_hora = {
        [Op.between]: [new Date(data_inicio), new Date(data_fim)]
      };
    }

    const agendamentos = await Agendamento.findAll({
      where,
      include: [
        { model: Pet, as: 'Pet' },
        { model: Cliente, as: 'Cliente' },
        { model: Usuario, as: 'Usuario', attributes: ['id', 'nome'] },
        { model: AgendamentoItem, as: 'Itens' }
      ],
      order: [['data_hora', 'ASC']]
    });

    return res.json(agendamentos);
  },

  async atualizarStatus(req, res) {
    const { agendamentoId } = req.params;
    const { status } = req.body;

    const agendamento = await Agendamento.findByPk(agendamentoId, {
      include: [{ model: Loja, as: 'Loja' }]
    });

    if (!agendamento) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    // Verifica se o usuário tem permissão para este agendamento
    if (agendamento.Loja.id !== req.lojaId) {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    await agendamento.update({ status });
    return res.json(agendamento);
  }
};