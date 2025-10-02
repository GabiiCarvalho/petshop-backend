const app = require('../app');

function checkRoutes() {
  console.log('🔍 Verificando rotas registradas...\n');
  
  // Lista de rotas que deveriam existir
  const expectedRoutes = [
    'GET /api/usuarios/user',
    'GET /api/usuarios',
    'POST /api/usuarios',
    'GET /api/usuarios/:id',
    'PUT /api/usuarios/:id',
    'DELETE /api/usuarios/:id'
  ];

  console.log('📋 Rotas esperadas:');
  expectedRoutes.forEach(route => console.log('  -', route));
  
  console.log('\n💡 Se a rota /user não funciona, tente:');
  console.log('  - GET /api/usuarios (lista usuários da loja)');
  console.log('  - GET /api/usuarios/1 (busca usuário específico)');
}

checkRoutes();