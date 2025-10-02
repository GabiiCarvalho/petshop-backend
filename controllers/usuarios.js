const { Usuario, Loja } = require('../models');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../config/auth');

module.exports = {
  // Listar TODOS os usuários (apenas para desenvolvimento)
  async listarTodos(req, res) {
    try {
      console.log('📋 Listando todos os usuários...');

      const usuarios = await Usuario.findAll({
        attributes: { exclude: ['senha_hash'] },
        include: [
          {
            model: Loja,
            as: 'loja',
            attributes: ['id', 'nome', 'email', 'telefone']
          }
        ],
        order: [['nome', 'ASC']]
      });

      console.log(`✅ Encontrados ${usuarios.length} usuários`);

      return res.json({
        total: usuarios.length,
        usuarios: usuarios
      });

    } catch (error) {
      console.error('❌ Erro ao listar usuários:', error);
      return res.status(500).json({
        error: 'Erro ao listar usuários',
        details: error.message
      });
    }
  },

  async listar(req, res) {
    try {
      const { lojaId, userCargo } = req;
      const { ativo, pagina = 1, limite = 20 } = req.query;

      console.log(`📋 Listando usuários da loja ${lojaId}`);

      // Gerentes só podem ver funcionários
      const where = { loja_id: lojaId };
      if (userCargo === 'gerente') where.cargo = 'funcionario';
      if (ativo) where.ativo = ativo === 'true';

      const usuarios = await Usuario.findAndCountAll({
        where,
        attributes: { exclude: ['senha_hash'] },
        include: [{
          model: Loja,
          as: 'loja',
          attributes: ['id', 'nome']
        }],
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
      console.error('❌ Erro ao listar usuários:', error);
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  },

  async cadastrar(req, res) {
    try {
      const { lojaId, userCargo } = req;
      const { email, senha, cargo, ...dados } = req.body;

      console.log('📝 Cadastrando novo usuário:', email);

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
        cargo: cargo || 'funcionario',
        loja_id: lojaId,
        ativo: true
      });

      // Remove senha do retorno
      const usuarioJson = usuario.toJSON();
      delete usuarioJson.senha_hash;

      console.log('✅ Usuário cadastrado com sucesso:', usuario.email);

      res.status(201).json(usuarioJson);
    } catch (error) {
      console.error('❌ Erro ao cadastrar usuário:', error);
      res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
  },

  async obterPorId(req, res) {
    try {
      const { lojaId } = req;
      const { usuarioId } = req.params;

      console.log(`🔍 Buscando usuário ${usuarioId} da loja ${lojaId}`);

      const usuario = await Usuario.findOne({
        where: { id: usuarioId, loja_id: lojaId },
        attributes: { exclude: ['senha_hash'] },
        include: [{
          model: Loja,
          as: 'loja',
          attributes: ['id', 'nome', 'email', 'telefone']
        }]
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json(usuario);
    } catch (error) {
      console.error('❌ Erro ao obter usuário:', error);
      res.status(500).json({ error: 'Erro ao obter usuário' });
    }
  },

  async atualizar(req, res) {
    try {
      const { lojaId } = req;
      const { usuarioId } = req.params;

      console.log(`✏️ Atualizando usuário ${usuarioId}`);

      const usuario = await Usuario.findOne({
        where: { id: usuarioId, loja_id: lojaId },
        attributes: { exclude: ['senha_hash'] }
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Não permite atualizar loja_id
      const { loja_id, senha, ...dados } = req.body;

      // Se houver nova senha, criptografa
      if (senha) {
        dados.senha_hash = await bcrypt.hash(senha, 8);
      }

      await usuario.update(dados);

      console.log('✅ Usuário atualizado com sucesso');

      res.json(usuario);
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  },

  async desativar(req, res) {
    try {
      const { lojaId, userId } = req;
      const { usuarioId } = req.params;

      console.log(`🚫 Desativando usuário ${usuarioId}`);

      // Não permite desativar a si mesmo
      if (parseInt(usuarioId) === parseInt(userId)) {
        return res.status(400).json({ error: 'Você não pode desativar seu próprio usuário' });
      }

      const usuario = await Usuario.findOne({
        where: { id: usuarioId, loja_id: lojaId }
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await usuario.update({ ativo: false });

      console.log('✅ Usuário desativado com sucesso');

      res.json({ message: 'Usuário desativado com sucesso' });
    } catch (error) {
      console.error('❌ Erro ao desativar usuário:', error);
      res.status(500).json({ error: 'Erro ao desativar usuário' });
    }
  },

  async promoverGerente(req, res) {
    try {
      const { lojaId, userCargo } = req;
      const { usuarioId } = req.params;

      // Apenas proprietários podem promover gerentes
      if (userCargo !== 'proprietario') {
        return res.status(403).json({ error: 'Apenas proprietários podem promover gerentes' });
      }

      const usuario = await Usuario.findOne({
        where: { id: usuarioId, loja_id: lojaId }
      });

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await usuario.update({ cargo: 'gerente' });

      res.json({ message: 'Usuário promovido a gerente com sucesso' });
    } catch (error) {
      console.error('❌ Erro ao promover usuário:', error);
      res.status(500).json({ error: 'Erro ao promover usuário' });
    }
  }
};