const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Loja = sequelize.define('Loja', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    endereco: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    telefone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    cnpj: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    }
  }, {
    tableName: 'lojas',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  Loja.associate = function(models) {
    Loja.hasMany(models.Usuario, {
      foreignKey: 'loja_id',
      as: 'usuarios'
    });
  };

  return Loja;
};