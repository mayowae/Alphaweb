const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Investment = sequelize.define('Investment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'customer_id',
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'customer_name'
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    plan: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Investment plan name (e.g., Gold Plan, Silver Plan)'
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Duration in months'
    },
    interestRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      field: 'interest_rate',
      comment: 'Annual interest rate percentage'
    },
    status: {
      type: DataTypes.ENUM('Active', 'Matured', 'Withdrawn', 'Deleted'),
      defaultValue: 'Active'
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
    dateCreated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'date_created'
    },
    maturityDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'maturity_date'
    },
    expectedReturns: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      field: 'total_return',
      comment: 'Expected returns at maturity'
    },
    currentValue: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
      comment: 'Current investment value'
    }
  }, {
    tableName: 'investments',
    timestamps: true,
    hooks: {
      beforeCreate: (investment) => {
        // Set default interest rate based on plan
        if (!investment.interestRate) {
          switch (investment.plan.toLowerCase()) {
            case 'gold plan':
              investment.interestRate = 15.0;
              break;
            case 'silver plan':
              investment.interestRate = 12.0;
              break;
            case 'bronze plan':
              investment.interestRate = 10.0;
              break;
            default:
              investment.interestRate = 8.0;
          }
        }
        
        // Calculate maturity date
        const createdDate = new Date(investment.dateCreated || new Date());
        const maturityDate = new Date(createdDate);
        maturityDate.setMonth(maturityDate.getMonth() + parseInt(investment.duration));
        investment.maturityDate = maturityDate;
        
        // Calculate expected returns (compound interest)
        const principal = parseFloat(investment.amount);
        const rate = parseFloat(investment.interestRate) / 100;
        const time = parseInt(investment.duration) / 12; // Convert months to years
        
        // Compound interest formula: A = P(1 + r)^t
        investment.expectedReturns = principal * Math.pow(1 + rate, time);
        investment.currentValue = principal; // Initially equals principal
      }
    }
  });

  Investment.associate = (models) => {
    // Investment belongs to Customer
    Investment.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer'
    });

    // Investment belongs to Merchant
    Investment.belongsTo(models.Merchant, {
      foreignKey: 'merchantId',
      as: 'merchant'
    });
  };

  return Investment;
};
