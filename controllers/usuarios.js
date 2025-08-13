const { Usuario, Loja } = require('../models');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/auth');

module.exports = {
  async listar(req, res) {
    try {
      const { lojaId, userCargo } = req;
      const { ativo, pagina = 1, limite = 20 } = req.query;

      // Gerentes só podem ver funcionários
      const where = { loja_id: lojaId };
      if (userCargo === 'gerente') where.cargo = 'funcionario';
      if (ativo) where.ativo = ativo === 'true';

      const usuarios = await Usuario.findAndCountAll({
        where,
        attributes: { exclude: ['senha_hash'] },
        include: [{ model: Loja, attributes: ['id', 'nome'] }],
        limit: parseInt(limite),
        offset: (pagina - 1) * limite,
        order: [['nome', 'ASC']]
      });

      res.json({
        total: usuarios.count,
        pagina: parseInt(pagina),
        totalPaginas: Math.ceil(usuarios.count / limite),
        usuarios: usuarios.rows
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  },

  async cadastrar(req, res) {
    try {
      const { lojaId, userCargo } = req;
      const { email, senha, cargo, ...dados } = req.body;

      // Verifica permissões
      if (userCargo === 'gerente' && cargo !== 'funcionario') {
        return res.status(403).json({ error: 'Gerentes só podem cadastrar funcionários' });
      }

      // Verifica se email já existe
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Criptografa senha
      const senha_hash = await bcrypt.hash(senha, 8);

      const usuario = await Usuario.create({
        ...dados,
        email,
        senha_hash,
        cargo,
        loja_id: lojaId
      });

      // Remove senha do retorno
      const usuarioJson = usuario.toJSON();
      delete usuarioJson.senha_hash;

      res.status(201).json(usuarioJson);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
  },

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      const usuario = await Usuario.findOne({
        where: { email },
        include: [{ model: Loja, attributes: ['id', 'nome'] }]
      });

      if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      if (!usuario.ativo) {
        return res.status(401).json({ error: 'Usuário inativo' });
      }

      // Gera token
      const token = generateToken(usuario);

      // Remove senha do retorno
      const usuarioJson = usuario.toJSON();
      delete usuarioJson.senha_hash;

      res.json({ usuario: usuarioJson, token });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao realizar login' });
    }
  },

  async obterPerfil(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.userId, {
        attributes: { exclude: ['senha_hash'] },
        include: [{ model: Loja, attributes: ['id', 'nome'] }]
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter perfil' });
    }
  },

  async atualizarPerfil(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.userId, {
        attributes: { exclude: ['senha_hash'] }
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Não permite atualizar email, cargo ou loja pelo perfil
      const { email, cargo, loja_id, ...dados } = req.body;
      await usuario.update(dados);

      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  },

  async atualizarSenha(req, res) {
    try {
      const { senhaAtual, novaSenha } = req.body;
      const usuario = await Usuario.findByPk(req.userId);

      if (!(await bcrypt.compare(senhaAtual, usuario.senha_hash))) {
        return res.status(401).json({ error: 'Senha atual incorreta' });
      }

      usuario.senha_hash = await bcrypt.hash(novaSenha, 8);
      await usuario.save();

      res.json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar senha' });
    }
  },

  async atualizarUsuario(req, res) {
    try {
      const { lojaId } = req;
      const { id } = req.params;

      const usuario = await Usuario.findOne({ 
        where: { id, loja_id: lojaId },
        attributes: { exclude: ['senha_hash'] }
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Não permite atualizar loja_id
      const { loja_id, ...dados } = req.body;
      await usuario.update(dados);

      res.json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  },

  async desativarUsuario(req, res) {
    try {
      const { lojaId, userId } = req;
      const { id } = req.params;

      // Não permite desativar a si mesmo
      if (id == userId) {
        return res.status(400).json({ error: 'Você não pode desativar seu próprio usuário' });
      }

      const usuario = await Usuario.findOne({ where: { id, loja_id: lojaId } });
      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await usuario.update({ ativo: false });
      res.json({ message: 'Usuário desativado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao desativar usuário' });
    }
  }
};