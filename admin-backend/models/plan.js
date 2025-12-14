module.exports = (sequelize, DataTypes) => {
  const Plan = sequelize.define('Plan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    billingCycle: {
      type: DataTypes.ENUM('monthly', 'yearly'),
      allowNull: false,
      field: 'billing_cycle'
    },
    pricing: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'end_date'
    },
    merchantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'merchant_id',
      references: {
        model: 'merchants',
        key: 'id'
      }
    },
    noOfBranches: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'no_of_branches'
    },
    noOfCustomers: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'no_of_customers'
    },
    noOfAgents: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'no_of_agents'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'plans',
    timestamps: true
  });

  Plan.associate = (models) => {
    // Plan belongs to a Merchant
    Plan.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
      as: 'merchant'
    });
  };

  return Plan;
};
