module.exports = (sequelize, DataTypes) => {
  const PlanoMensal = sequelize.define('PlanoMensal', {
    data_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    data_fim: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    banhos_inclusos: {
      type: DataTypes.INTEGER,
      defaultValue: 4
    },
    banhos_utilizados: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    tosas_inclusas: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    tosas_utilizadas: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    valor_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('ativo', 'inativo', 'suspenso'),
      defaultValue: 'ativo'
    }
  }, {
    tableName: 'planos_mensais',
    timestamps: true,
    createdAt: 'data_criacao',
    updatedAt: 'data_atualizacao'
  });

  PlanoMensal.associate = (models) => {
    PlanoMensal.belongsTo(models.Pet, { foreignKey: 'pet_id' });
    PlanoMensal.belongsTo(models.Loja, { foreignKey: 'loja_id' });
    PlanoMensal.hasMany(models.AgendamentoItem, { foreignKey: 'plano_mensal_id' });
  };

  return PlanoMensal;
};