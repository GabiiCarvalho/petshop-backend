module.exports = (sequelize, DataTypes) => {
  const Agendamento = sequelize.define('Agendamento', {
    data_hora: {
      type: DataTypes.DATE,
      allowNull: false
    },
    data_hora_fim: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('agendado', 'em_andamento', 'concluido', 'cancelado'),
      defaultValue: 'agendado'
    },
    observacoes: {
      type: DataTypes.TEXT
    },
    usando_plano: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'agendamentos',
    timestamps: true
  });

  Agendamento.associate = (models) => {
    Agendamento.belongsTo(models.Loja, { foreignKey: 'loja_id' });
    Agendamento.belongsTo(models.Pet, { foreignKey: 'pet_id' });
    Agendamento.belongsTo(models.Cliente, { foreignKey: 'cliente_id' });
    Agendamento.belongsTo(models.Usuario, { foreignKey: 'usuario_id' });
    Agendamento.hasMany(models.AgendamentoItem, { foreignKey: 'agendamento_id' });
    Agendamento.hasMany(models.Venda, { foreignKey: 'agendamento_id' });
  };

  return Agendamento;
};