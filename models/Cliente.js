module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    telefone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(100),
      validate: {
        isEmail: true
      }
    },
    endereco: {
      type: DataTypes.TEXT
    },
    observacoes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'clientes',
    timestamps: true,
    createdAt: 'data_criacao',
    updatedAt: 'data_atualizacao'
  });

  Cliente.associate = (models) => {
    Cliente.belongsTo(models.Loja, { foreignKey: 'loja_id' });
    Cliente.hasMany(models.Pet, { foreignKey: 'cliente_id' });
    Cliente.hasMany(models.Agendamento, { foreignKey: 'cliente_id' });
    Cliente.hasMany(models.Venda, { foreignKey: 'cliente_id' });
  };

  return Cliente;
};