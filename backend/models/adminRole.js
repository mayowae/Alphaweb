module.exports = (sequelize, DataTypes) => {
  const AdminRole = sequelize.define('AdminRole', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    permissions: {
      type: DataTypes.JSON, // e.g. ["CREATE_USER", "DELETE_USER", ...]
      allowNull: true,
    },
  }, {
    tableName: 'AdminRoles',
    timestamps: true,
  });

  AdminRole.associate = (models) => {
    AdminRole.hasMany(models.AdminStaff, { foreignKey: 'roleId' });
  };

  return AdminRole;
};
