module.exports = (sequelize, DataTypes) => {
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
        notEmpty: {
          msg: 'O nome do usuário é obrigatório'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Email inválido'
        },
        notEmpty: {
          msg: 'O email é obrigatório'
        }
      }
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'A senha é obrigatória'
        },
        len: {
          args: [6, 100],
          msg: 'A senha deve ter entre 6 e 100 caracteres'
        }
      }
    },
    tipo: {
      type: DataTypes.ENUM('admin', 'gerente', 'cliente'),
      allowNull: false,
      defaultValue: 'cliente'
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    tableName: 'usuarios',
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['senha'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['senha'] }
      }
    }
  });

  Usuario.associate = (models) => {
    Usuario.hasMany(models.Loja, {
      foreignKey: 'usuario_id',
      as: 'lojas'
    });
  };

  return Usuario;
};