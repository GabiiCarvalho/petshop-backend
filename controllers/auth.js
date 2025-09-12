const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Loja } = require('../models');

module.exports = {
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const usuario = await Usuario.findOne({ 
        where: { email },
        include: [{ model: Loja, as: 'loja' }]
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
          loja_nome: usuario.loja?.nome
        },
        token
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async cadastrarProprietario(req, res) {
    try {
      const { nome, email, senha, loja } = req.body;

      // Validações de campos obrigatórios
      if (!nome || !email || !senha || !loja || !loja.nome || !loja.endereco || !loja.telefone) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
      }

      // Verifica se usuário já existe
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Cria a loja primeiro
      const novaLoja = await Loja.create({
        nome: loja.nome,
        endereco: loja.endereco,
        telefone: loja.telefone,
        email: loja.email || email,
        cnpj: loja.cnpj || null
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
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};