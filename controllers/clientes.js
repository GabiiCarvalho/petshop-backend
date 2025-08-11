const { Cliente, Pet, Agendamento } = require('../models');

module.exports = {
  async listar(req, res) {
    const { lojaId } = req;
    const { pagina = 1, limite = 20 } = req.query;

    const clientes = await Cliente.findAndCountAll({
      where: { loja_id: lojaId },
      limit: parseInt(limite),
      offset: (pagina - 1) * limite,
      order: [['nome', 'ASC']]
    });

    return res.json({
      total: clientes.count,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(clientes.count / limite),
      clientes: clientes.rows
    });
  },

  async criar(req, res) {
    const { lojaId } = req;
    const { nome, telefone, email, endereco, observacoes } = req.body;

    // Verifica se cliente já existe pelo telefone
    const clienteExistente = await Cliente.findOne({ 
      where: { telefone, loja_id: lojaId } 
    });

    if (clienteExistente) {
      return res.status(400).json({ error: 'Cliente já cadastrado com este telefone' });
    }

    const cliente = await Cliente.create({
      nome,
      telefone,
      email,
      endereco,
      observacoes,
      loja_id: lojaId
    });

    return res.status(201).json(cliente);
  },

  async buscar(req, res) {
    const { lojaId } = req;
    const { termo } = req.params;

    const clientes = await Cliente.findAll({
      where: {
        loja_id: lojaId,
        [Op.or]: [
          { nome: { [Op.iLike]: `%${termo}%` } },
          { telefone: { [Op.iLike]: `%${termo}%` } }
        ]
      },
      limit: 10
    });

    return res.json(clientes);
  },

  async listarPets(req, res) {
    const { lojaId } = req;
    const { clienteId } = req.params;

    const pets = await Pet.findAll({
      where: { 
        cliente_id: clienteId,
        loja_id: lojaId
      },
      order: [['nome', 'ASC']]
    });

    return res.json(pets);
  }
};