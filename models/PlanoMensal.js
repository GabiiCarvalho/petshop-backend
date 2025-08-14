'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PlanoMensal extends Model {
    static associate(models) {
      // Defina as associações aqui
      PlanoMensal.belongsTo(models.Loja, {
        foreignKey: 'loja_id',
        as: 'loja'
      });
      PlanoMensal.belongsTo(models.Pet, {
        foreignKey: 'pet_id',
        as: 'pet'
      });
      PlanoMensal.belongsTo(models.Cliente, {
        foreignKey: 'cliente_id',
        as: 'cliente'
      });
    }
  }

  PlanoMensal.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    loja_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'lojas',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    pet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pets',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    cliente_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'clientes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    data_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'Data início deve ser uma data válida'
        }
      }
    },
    data_fim: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'Data fim deve ser uma data válida'
        },
        isAfterStartDate(value) {
          if (new Date(value) <= new Date(this.data_inicio)) {
            throw new Error('Data fim deve ser após data início');
          }
        }
      }
    },
    banhos_inclusos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 4,
      validate: {
        min: {
          args: [1],
          msg: 'Deve incluir pelo menos 1 banho'
        }
      }
    },
    banhos_utilizados: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Banhos utilizados não pode ser negativo'
        }
      }
    },
    tosas_inclusas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: [0],
          msg: 'Tosas inclusas não pode ser negativo'
        }
      }
    },
    tosas_utilizadas: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Tosas utilizadas não pode ser negativo'
        }
      }
    },
    valor_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0.01],
          msg: 'Valor total deve ser maior que zero'
        }
      }
    },
    status: {
      type: DataTypes.ENUM('ativo', 'inativo', 'suspenso'),
      allowNull: false,
      defaultValue: 'ativo'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'PlanoMensal',
    tableName: 'planos_mensais',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    hooks: {
      beforeValidate: (plano) => {
        // Garante que data_fim seja maior que data_inicio
        if (plano.data_inicio && plano.data_fim && new Date(plano.data_fim) <= new Date(plano.data_inicio)) {
          throw new Error('Data fim deve ser após data início');
        }
      }
    }
  });

  return PlanoMensal;
};