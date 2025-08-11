module.exports = (sequelize, DataTypes) => {
  const Servico = sequelize.define('Servico', {
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    descricao: {
      type: DataTypes.TEXT
    },
    preco: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    duracao_minutos: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'servicos',
    timestamps: true,
    createdAt: 'data_criacao',
    updatedAt: 'data_atualizacao'
  });

  Servico.associate = (models) => {
    Servico.belongsTo(models.Loja, { foreignKey: 'loja_id' });
    Servico.hasMany(models.AgendamentoItem, { foreignKey: 'servico_id' });
    Servico.hasMany(models.VendaItem, { foreignKey: 'servico_id' });
  };

  return Servico;
};