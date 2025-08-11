const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Loja } = require('../models');

module.exports = {
  async login(req, res) {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ 
      where: { email },
      include: [{ model: Loja, as: 'Loja' }]
    });

    if (!usuario) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    if (!usuario.ativo) {
      return res.status(400).json({ error: 'Usuário inativo' });
    }

    if (!(await bcrypt.compare(senha, usuario.senha_hash))) {
      return res.status(400).json({ error: 'Senha inválida' });
    }

    const { id, nome, cargo, loja_id } = usuario;
    const token = jwt.sign(
      { id, nome, cargo, loja_id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    return res.json({
      usuario: {
        id,
        nome,
        email: usuario.email,
        cargo,
        loja_id,
        loja_nome: usuario.Loja?.nome
      },
      token
    });
  },

  async cadastrarProprietario(req, res) {
    // Apenas administradores do sistema podem cadastrar novos proprietários
    const { nome, email, senha, loja } = req.body;

    // Verifica se usuário já existe
    if (await Usuario.findOne({ where: { email } })) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Cria a loja primeiro
    const novaLoja = await Loja.create({
      nome: loja.nome,
      endereco: loja.endereco,
      telefone: loja.telefone,
      email: loja.email
    });

    // Cria o usuário proprietário
    const senha_hash = await bcrypt.hash(senha, 8);
    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha_hash,
      cargo: 'proprietario',
      loja_id: novaLoja.id
    });

    return res.status(201).json({
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        cargo: novoUsuario.cargo,
        loja_id: novaLoja.id
      },
      loja: novaLoja
    });
  }
};