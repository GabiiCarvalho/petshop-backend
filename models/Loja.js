module.exports = (sequelize, DataTypes) => {
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
        notEmpty: {
          msg: 'O nome da loja é obrigatório'
        },
        len: {
          args: [3, 100],
          msg: 'O nome da loja deve ter entre 3 e 100 caracteres'
        }
      }
    },
    endereco: {
      type: DataTypes.STRING,
      allowNull: false
    },
    telefone: {
      type: DataTypes.STRING,
      validate: {
        is: {
          args: /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/,
          msg: 'Telefone inválido'
        }
      }
    },
    cnpj: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        isCNPJ(value) {
          if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/.test(value)) {
            throw new Error('CNPJ inválido');
          }
        }
      }
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    }
  }, {
    tableName: 'lojas',
    timestamps: true
  });

  Loja.associate = (models) => {
    Loja.belongsTo(models.Usuario, {
      foreignKey: 'usuario_id',
      as: 'proprietario'
    });
  };

  return Loja;
};