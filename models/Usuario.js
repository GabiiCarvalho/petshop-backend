const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Usuario = sequelize.define('Usuario', {
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    senha_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cargo: {
      type: DataTypes.ENUM('proprietario', 'funcionario'),
      allowNull: false,
      defaultValue: 'funcionario'
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    loja_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Lojas',
        key: 'id'
      }
    }
  }, {
    tableName: 'usuarios',
    timestamps: true,
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  });

  Usuario.associate = function(models) {
    Usuario.belongsTo(models.Loja, {
      foreignKey: 'loja_id',
      as: 'loja'
    });
  };

  return Usuario;
};