'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('planos_mensais', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      loja_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'lojas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      pet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cliente_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clientes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      data_inicio: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        validate: {
          isDate: {
            msg: 'Data início deve ser uma data válida'
          }
        }
      },
      data_fim: {
        type: Sequelize.DATEONLY,
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
        type: Sequelize.INTEGER,
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
        type: Sequelize.INTEGER,
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
        type: Sequelize.INTEGER,
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
        type: Sequelize.INTEGER,
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
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: {
            args: [0.01],
            msg: 'Valor total deve ser maior que zero'
          }
        }
      },
      status: {
        type: Sequelize.ENUM('ativo', 'inativo', 'suspenso'),
        allowNull: false,
        defaultValue: 'ativo'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Adiciona índices para otimização
    await queryInterface.addIndex('planos_mensais', ['status']);
    await queryInterface.addIndex('planos_mensais', ['data_fim']);
    await queryInterface.addIndex('planos_mensais', ['pet_id']);
    await queryInterface.addIndex('planos_mensais', ['cliente_id']);
    await queryInterface.addIndex('planos_mensais', ['loja_id']);

    // Adiciona coluna tem_plano em pets
    await queryInterface.addColumn('pets', 'tem_plano', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o pet possui plano ativo'
    });

    // Adiciona coluna usando_plano em agendamento_itens
    await queryInterface.addColumn('agendamento_itens', 'usando_plano', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o item está usando crédito do plano'
    });
  },

  down: async (queryInterface) => {
    // Ordem reversa para evitar erros de chave estrangeira
    await queryInterface.removeColumn('agendamento_itens', 'usando_plano');
    await queryInterface.removeColumn('pets', 'tem_plano');
    await queryInterface.dropTable('planos_mensais');
  }
};