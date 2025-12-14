module.exports = (sequelize, DataTypes) => {
  const AdminLog = sequelize.define('AdminLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    staffId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'AdminStaffs', // table name in DB
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },

    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    metadata: {
      type: DataTypes.JSON,
      allowNull: true, // can hold IP, payload, etc.
    },

  }, {
    tableName: 'AdminLogs',
    timestamps: true, // includes createdAt & updatedAt
  });

//   AdminLog.associate = (models) => {
//     AdminLog.belongsTo(models.AdminStaff, { 
//       foreignKey: 'staffId', 
//       as: 'staff' 
//     });
//   };

  return AdminLog;
};
