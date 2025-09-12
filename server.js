// server.js
require('dotenv').config();
const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 3001;

console.log('🔄 Iniciando servidor...');
console.log('📋 Carregando configurações...');

// Verificar variáveis de ambiente
console.log('🔧 PORT:', process.env.PORT);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexão com o banco estabelecida com sucesso.');
    return db.sequelize.sync({ force: false });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log('🚀 Servidor iniciado com sucesso!');
      console.log(`📍 Porta: ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log('⏰', new Date().toLocaleString());
    });
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao banco:', err.message);
    console.error('📋 Detalhes:', err);
    process.exit(1);
  });