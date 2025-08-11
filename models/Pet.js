module.exports = (sequelize, DataTypes) => {
  const Pet = sequelize.define('Pet', {
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    especie: {
      type: DataTypes.ENUM('cachorro', 'gato', 'outro'),
      allowNull: false
    },
    raca: {
      type: DataTypes.STRING(100)
    },
    data_nascimento: {
      type: DataTypes.DATEONLY
    },
    peso: {
      type: DataTypes.DECIMAL(5, 2)
    },
    alergias: {
      type: DataTypes.TEXT
    },
    observacoes: {
      type: DataTypes.TEXT
    },
    foto_url: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'pets',
    timestamps: true,
    createdAt: 'data_criacao',
    updatedAt: 'data_atualizacao'
  });

  Pet.associate = (models) => {
    Pet.belongsTo(models.Loja, { foreignKey: 'loja_id' });
    Pet.belongsTo(models.Cliente, { foreignKey: 'cliente_id' });
    Pet.hasMany(models.Agendamento, { foreignKey: 'pet_id' });
    Pet.hasMany(models.PlanoMensal, { foreignKey: 'pet_id' });
  };

  return Pet;
};