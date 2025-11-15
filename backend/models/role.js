module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    roleName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cantView: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    canViewOnly: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    canEdit: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'roles',
    timestamps: true,
  });

  return Role;
};
