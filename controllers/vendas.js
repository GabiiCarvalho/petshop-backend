const { Venda, VendaItem, Cliente, Produto, Servico, Agendamento } = require('../models');

module.exports = {
  async criar(req, res) {
    const { lojaId, userId } = req;
    const { cliente_id, itens, forma_pagamento, observacoes } = req.body;

    // Verifica se cliente pertence à loja
    if (cliente_id) {
      const cliente = await Cliente.findOne({ 
        where: { id: cliente_id, loja_id: lojaId } 
      });
      if (!cliente) {
        return res.status(400).json({ error: 'Cliente não encontrado' });
      }
    }

    let subtotal = 0;
    const itensVenda = [];

    // Valida e calcula os itens
    for (const item of itens) {
      if (item.produto_id) {
        const produto = await Produto.findOne({ 
          where: { id: item.produto_id, loja_id: lojaId } 
        });
        if (!produto) {
          return res.status(400).json({ error: `Produto ID ${item.produto_id} não encontrado` });
        }
        if (produto.estoque < item.quantidade) {
          return res.status(400).json({ error: `Estoque insuficiente para o produto ${produto.nome}` });
        }

        const totalItem = produto.preco * item.quantidade;
        subtotal += totalItem;

        itensVenda.push({
          produto_id: produto.id,
          item_nome: produto.nome,
          item_descricao: produto.descricao,
          quantidade: item.quantidade,
          preco_unitario: produto.preco,
          total: totalItem
        });

        // Atualiza estoque
        await produto.update({ 
          estoque: produto.estoque - item.quantidade 
        });
      } else if (item.servico_id) {
        const servico = await Servico.findOne({ 
          where: { id: item.servico_id, loja_id: lojaId } 
        });
        if (!servico) {
          return res.status(400).json({ error: `Serviço ID ${item.servico_id} não encontrado` });
        }

        const totalItem = servico.preco * (item.quantidade || 1);
        subtotal += totalItem;

        itensVenda.push({
          servico_id: servico.id,
          item_nome: servico.nome,
          item_descricao: servico.descricao,
          quantidade: item.quantidade || 1,
          preco_unitario: servico.preco,
          total: totalItem
        });

        // Se houver agendamento associado
        if (item.agendamento_id) {
          const agendamento = await Agendamento.findOne({
            where: { 
              id: item.agendamento_id,
              loja_id: lojaId
            }
          });
          if (!agendamento) {
            return res.status(400).json({ error: `Agendamento ID ${item.agendamento_id} não encontrado` });
          }
          itensVenda[itensVenda.length - 1].agendamento_id = agendamento.id;
        }
      }
    }

    // Cria a venda
    const venda = await Venda.create({
      loja_id: lojaId,
      cliente_id: cliente_id || null,
      usuario_id: userId,
      subtotal,
      total: subtotal, // Sem desconto por padrão
      forma_pagamento,
      observacoes
    });

    // Cria os itens da venda
    const itensCriados = await Promise.all(
      itensVenda.map(item => VendaItem.create({
        venda_id: venda.id,
        ...item
      }))
    );

    return res.status(201).json({
      venda,
      itens: itensCriados
    });
  },

  async relatorioPeriodo(req, res) {
    const { lojaId } = req;
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Datas de início e fim são obrigatórias' });
    }

    const vendas = await Venda.findAll({
      where: {
        loja_id: lojaId,
        data_hora: {
          [Op.between]: [new Date(data_inicio), new Date(data_fim)]
        }
      },
      include: [
        { model: Cliente, attributes: ['id', 'nome'] },
        { model: VendaItem, include: [
          { model: Produto, attributes: ['id', 'nome'] },
          { model: Servico, attributes: ['id', 'nome'] }
        ]}
      ],
      order: [['data_hora', 'DESC']]
    });

    const totalVendas = vendas.reduce((sum, venda) => sum + parseFloat(venda.total), 0);
    const totalItens = vendas.reduce((sum, venda) => sum + venda.VendaItems.length, 0);

    return res.json({
      periodo: `${data_inicio} até ${data_fim}`,
      total_vendas: vendas.length,
      valor_total: totalVendas,
      total_itens: totalItens,
      vendas
    });
  }
};