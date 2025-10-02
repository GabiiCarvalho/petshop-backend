// scripts/sync-database.js
require('dotenv').config();
const db = require('../models');

async function syncDatabase() {
  try {
    console.log('🔄 Sincronizando banco de dados...');
    
    // Forçar recriação das tabelas (CUIDADO: apaga dados existentes)
    await db.sequelize.sync({ force: true });
    
    console.log('✅ Banco sincronizado com sucesso!');
    
    // Criar usuário de teste
    await createTestUser();
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco:', error);
  } finally {
    await db.sequelize.close();
  }
}

async function createTestUser() {
  try {
    const bcrypt = require('bcryptjs');
    
    // Criar loja
    const loja = await db.Loja.create({
      nome: 'Trato Fino',
      endereco: 'Rua Bagdá, 102',
      telefone: '47996647742',
      email: 'pettratofino@gmail.com',
      cnpj: '33569478000100'
    });

    // Criar usuário
    const senha_hash = await bcrypt.hash('142536', 8);
    const usuario = await db.Usuario.create({
      nome: 'Maria Madalena',
      email: 'pettratofino@gmail.com',
      senha_hash: senha_hash,
      cargo: 'proprietario',
      loja_id: loja.id,
      ativo: true
    });

    console.log('✅ Usuário de teste criado:');
    console.log('👤 Email: pettratofino@gmail.com');
    console.log('🔐 Senha: 142536');
    console.log('🏪 Loja: Trato Fino');

  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
  }
}

syncDatabase();