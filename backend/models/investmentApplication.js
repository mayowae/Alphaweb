const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InvestmentApplication = sequelize.define('InvestmentApplication', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Customer account number'
    },
    targetAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      comment: 'Target investment amount'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Duration in days'
    },
    agentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'agents',
        key: 'id'
      }
    },
    agentName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Agent handling the application'
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Branch where application was submitted'
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Completed'),
      defaultValue: 'Pending'
    },
    merchantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'merchants',
        key: 'id'
      }
    },
    dateApplied: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes or comments'
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'staff',
        key: 'id'
      }
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reason for rejection if applicable'
    }
  }, {
    tableName: 'investment_applications',
    timestamps: true,
    indexes: [
      {
        fields: ['merchantId']
      },
      {
        fields: ['customerId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['dateApplied']
      }
    ]
  });

  InvestmentApplication.associate = (models) => {
    InvestmentApplication.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer'
    });
    
    InvestmentApplication.belongsTo(models.Agent, {
      foreignKey: 'agentId',
      as: 'agent'
    });
    
    InvestmentApplication.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
      as: 'merchant'
    });
    
    InvestmentApplication.belongsTo(models.Staff, {
      foreignKey: 'approvedBy',
      as: 'approver'
    });
  };

  return InvestmentApplication;
};
