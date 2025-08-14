require('dotenv').config();
const db = require('../models');

async function testModels() {
  try {
    await db.sequelize.sync({ force: false });

    const [usuario] = await db.Usuario.findOrCreate({
      where: { email: 'exemplo@email.com' },
      defaults: {
        nome: 'Usuário Teste',
        senha: 'senha123',
        tipo: 'admin'
      }
    });

    const usuarioComLojas = await db.Usuario.findOne({
        where: { email: 'exeplo@email.com' },
        include: [{ modelo: db.Loja, as: 'lojas' }]
    });
    
    console.log('Usuário encontrado:', JSON.stringify(usuarioComLojas, null, 2));
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
  } finally {

    await db.sequelize.close();
  }
}

testModels();