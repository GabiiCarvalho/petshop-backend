const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    port: config.port,
    logging: config.logging,
    dialectOptions: config.dialectOptions || {},
    pool: config.pool || {}
  }
);

const db = {
  Sequelize,
  sequelize,
  Usuario: require('./Usuario')(sequelize, Sequelize),
  Loja: require('./Loja')(sequelize, Sequelize)
};

// Definir associações entre modelos
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;