const { 
  Agendamento, 
  Cliente, 
  Pet, 
  Venda, 
  Servico,
  PlanoMensal,
  Sequelize 
} = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

module.exports = {
  async getDashboardData(req, res) {
    try {
      const { lojaId } = req;
      const { periodo = 'semana' } = req.query;

      // Configura período para filtros
      let startDate, endDate;
      switch (periodo) {
        case 'dia':
          startDate = moment().startOf('day').toDate();
          endDate = moment().endOf('day').toDate();
          break;
        case 'semana':
          startDate = moment().startOf('week').toDate();
          endDate = moment().endOf('week').toDate();
          break;
        case 'mes':
          startDate = moment().startOf('month').toDate();
          endDate = moment().endOf('month').toDate();
          break;
        default:
          startDate = moment().startOf('week').toDate();
          endDate = moment().endOf('week').toDate();
      }

      // Consultas paralelas para melhor performance
      const [
        totalClientes,
        totalPets,
        agendamentosHoje,
        agendamentosPeriodo,
        vendasPeriodo,
        servicosPopulares,
        planosAtivos,
        statusAgendamentos
      ] = await Promise.all([
        // Total de clientes cadastrados
        Cliente.count({ where: { loja_id: lojaId } }),

        // Total de pets cadastrados
        Pet.count({ where: { loja_id: lojaId } }),

        // Agendamentos para hoje
        Agendamento.findAll({
          where: {
            loja_id: lojaId,
            data_hora: {
              [Op.between]: [
                moment().startOf('day').toDate(),
                moment().endOf('day').toDate()
              ]
            }
          },
          include: [
            { model: Pet, attributes: ['id', 'nome'] },
            { model: Cliente, attributes: ['id', 'nome'] }
          ],
          order: [['data_hora', 'ASC']]
        }),

        // Agendamentos no período selecionado
        Agendamento.findAll({
          where: {
            loja_id: lojaId,
            data_hora: { [Op.between]: [startDate, endDate] }
          },
          attributes: [
            [Sequelize.fn('date', Sequelize.col('data_hora')), 'data'],
            [Sequelize.fn('count', Sequelize.col('id')), 'total']
          ],
          group: ['data'],
          raw: true
        }),

        // Vendas no período
        Venda.findAll({
          where: {
            loja_id: lojaId,
            data_hora: { [Op.between]: [startDate, endDate] }
          },
          attributes: [
            [Sequelize.fn('date', Sequelize.col('data_hora')), 'data'],
            [Sequelize.fn('sum', Sequelize.col('total')), 'total']
          ],
          group: ['data'],
          raw: true
        }),

        // Serviços mais populares
        Servico.findAll({
          where: { loja_id: lojaId },
          include: [{
            association: 'AgendamentoItens',
            attributes: [],
            required: true,
            include: [{
              association: 'Agendamento',
              where: { loja_id: lojaId }
            }]
          }],
          attributes: [
            'id',
            'nome',
            [Sequelize.fn('COUNT', Sequelize.col('AgendamentoItens.id')), 'total']
          ],
          group: ['Servico.id'],
          order: [[Sequelize.literal('total'), 'DESC']],
          limit: 5
        }),

        // Planos mensais ativos
        PlanoMensal.count({
          where: {
            loja_id: lojaId,
            status: 'ativo',
            data_fim: { [Op.gte]: new Date() }
          }
        }),

        // Status dos agendamentos
        Agendamento.findAll({
          where: { loja_id: lojaId },
          attributes: [
            'status',
            [Sequelize.fn('count', Sequelize.col('id')), 'total']
          ],
          group: ['status'],
          raw: true
        })
      ]);

      // Formata dados para o dashboard
      const dashboardData = {
        metricas: {
          totalClientes,
          totalPets,
          planosAtivos,
          agendamentosHoje: agendamentosHoje.length,
          faturamentoPeriodo: vendasPeriodo.reduce((sum, item) => sum + parseFloat(item.total), 0)
        },
        graficos: {
          agendamentosPorDia: agendamentosPeriodo.map(item => ({
            data: moment(item.data).format('DD/MM'),
            total: item.total
          })),
          vendasPorDia: vendasPeriodo.map(item => ({
            data: moment(item.data).format('DD/MM'),
            total: parseFloat(item.total)
          })),
          statusAgendamentos: statusAgendamentos.map(item => ({
            status: item.status,
            total: item.total
          }))
        },
        servicosPopulares: servicosPopulares.map(servico => ({
          id: servico.id,
          nome: servico.nome,
          total: servico.dataValues.total
        })),
        proximosAgendamentos: agendamentosHoje
          .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora))
          .slice(0, 5)
          .map(agendamento => ({
            id: agendamento.id,
            data_hora: moment(agendamento.data_hora).format('HH:mm'),
            pet: agendamento.Pet.nome,
            cliente: agendamento.Cliente.nome,
            status: agendamento.status
          }))
      };

      res.json(dashboardData);
    } catch (error) {
      console.error('Erro no dashboard:', error);
      res.status(500).json({ error: 'Erro ao carregar dados do dashboard' });
    }
  },

  async getFinancialOverview(req, res) {
    try {
      const { lojaId } = req;
      const { meses = 6 } = req.query;

      const startDate = moment().subtract(meses, 'months').startOf('month');
      const endDate = moment().endOf('month');

      // Consulta para dados financeiros
      const financialData = await Venda.findAll({
        where: {
          loja_id: lojaId,
          data_hora: { [Op.between]: [startDate.toDate(), endDate.toDate()] }
        },
        attributes: [
          [Sequelize.fn('date_trunc', 'month', Sequelize.col('data_hora')), 'mes'],
          [Sequelize.fn('sum', Sequelize.col('total')), 'total'],
          [Sequelize.fn('count', Sequelize.col('id')), 'vendas']
        ],
        group: ['mes'],
        order: [['mes', 'ASC']],
        raw: true
      });

      // Formata os dados para o gráfico
      const formattedData = financialData.map(item => ({
        mes: moment(item.mes).format('MMM/YY'),
        total: parseFloat(item.total),
        vendas: item.vendas
      }));

      // Preenche meses sem vendas
      const monthsArray = [];
      let currentDate = startDate.clone();
      
      while (currentDate.isBefore(endDate)) {
        const monthStr = currentDate.format('MMM/YY');
        const existingData = formattedData.find(d => d.mes === monthStr);
        
        monthsArray.push(existingData || {
          mes: monthStr,
          total: 0,
          vendas: 0
        });
        
        currentDate.add(1, 'month');
      }

      res.json(monthsArray);
    } catch (error) {
      console.error('Erro no overview financeiro:', error);
      res.status(500).json({ error: 'Erro ao carregar dados financeiros' });
    }
  },

  async getServiceMetrics(req, res) {
    try {
      const { lojaId } = req;
      const { servicoId } = req.params;

      // Dados do serviço específico
      const servico = await Servico.findOne({
        where: { id: servicoId, loja_id: lojaId },
        include: [{
          association: 'AgendamentoItens',
          include: [{
            association: 'Agendamento',
            attributes: ['data_hora', 'status']
          }]
        }]
      });

      if (!servico) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      // Calcula métricas
      const totalRealizado = servico.AgendamentoItens
        .filter(item => item.Agendamento.status === 'concluido')
        .length;

      const totalAgendado = servico.AgendamentoItens
        .filter(item => item.Agendamento.status === 'agendado')
        .length;

      const ultimosMeses = await AgendamentoItem.findAll({
        where: { servico_id: servicoId },
        attributes: [
          [Sequelize.fn('date_trunc', 'month', Sequelize.col('Agendamento.data_hora')), 'mes'],
          [Sequelize.fn('count', Sequelize.col('AgendamentoItens.id')), 'total']
        ],
        include: [{
          association: 'Agendamento',
          where: { 
            loja_id: lojaId,
            data_hora: { [Op.gte]: moment().subtract(6, 'months').toDate() }
          },
          attributes: []
        }],
        group: ['mes'],
        order: [['mes', 'ASC']],
        raw: true
      });

      res.json({
        servico: {
          id: servico.id,
          nome: servico.nome,
          descricao: servico.descricao,
          preco: servico.preco
        },
        metricas: {
          totalRealizado,
          totalAgendado,
          faturamento: totalRealizado * servico.preco
        },
        historico: ultimosMeses.map(item => ({
          mes: moment(item.mes).format('MMM/YY'),
          total: item.total
        }))
      });
    } catch (error) {
      console.error('Erro nas métricas do serviço:', error);
      res.status(500).json({ error: 'Erro ao carregar métricas do serviço' });
    }
  }
};