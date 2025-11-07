module.exports = (sequelize, DataTypes) => {
  const AdminStaff = sequelize.define('AdminStaff', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  }, {
    tableName: 'AdminStaffs',
    timestamps: true,
  });

  AdminStaff.associate = (models) => {
    AdminStaff.belongsTo(models.AdminRole, { foreignKey: 'roleId' });
  };

  return AdminStaff;
};
