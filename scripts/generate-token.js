require('dotenv').config();
const jwt = require('jsonwebtoken');
const { Usuario, Loja } = require('../models');

async function generateTokenForUser(email) {
  try {
    console.log('🔍 Buscando usuário:', email);
    
    const usuario = await Usuario.findOne({
      where: { email },
      include: [{ model: Loja, as: 'loja' }]
    });

    if (!usuario) {
      console.log('❌ Usuário não encontrado');
      return null;
    }

    // Gerar token
    const token = jwt.sign(
      { 
        id: usuario.id, 
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
        loja_id: usuario.loja_id 
      },
      process.env.JWT_SECRET || 'segredo_temporario',
      { expiresIn: '7d' }
    );

    console.log('✅ Token gerado com sucesso!');
    console.log('👤 Usuário:', usuario.nome);
    console.log('🏪 Loja:', usuario.loja?.nome);
    console.log('🔑 Token:', token);
    console.log('\n📋 Para usar:');
    console.log(`curl -X GET http://localhost:3001/api/usuarios/user \\\n  -H "Authorization: Bearer ${token}" \\\n  -H "Content-Type: application/json"`);

    return token;
  } catch (error) {
    console.error('❌ Erro ao gerar token:', error);
    return null;
  }
}

// Uso: node scripts/generate-token.js pettratofino@gmail.com
const email = process.argv[2] || 'pettratofino@gmail.com';
generateTokenForUser(email).then(() => process.exit(0));