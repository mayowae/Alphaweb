const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('alphacollect_db', 'root', 'UJYmFcc5WNXZRmfApWfswlVUmtWYFnfW', {
  host: 'dpg-d2phh3mr433s73dakm90-a.oregon-postgres.render.com',
  port: 5432,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Merchant = require('./merchant')(sequelize, Sequelize.DataTypes);
db.Collaborator = require('./collaborator')(sequelize, Sequelize.DataTypes);
db.Agent = require('./agent')(sequelize, Sequelize.DataTypes);
db.Branch = require('./branch')(sequelize, Sequelize.DataTypes);
db.Customer = require('./customer')(sequelize, Sequelize.DataTypes);
db.Role = require('./role')(sequelize, Sequelize.DataTypes);
db.Staff = require('./staff')(sequelize, Sequelize.DataTypes);
db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.Charge = require('./charge')(sequelize, Sequelize.DataTypes);
db.ChargeAssignment = require('./chargeAssignment')(sequelize, Sequelize.DataTypes);
db.Loan = require('./loan')(sequelize, Sequelize.DataTypes);
db.Investment = require('./investment')(sequelize, Sequelize.DataTypes);
db.Package = require('./package')(sequelize, Sequelize.DataTypes);
db.Collection = require('./collection')(sequelize, Sequelize.DataTypes);
db.WalletTransaction = require('./walletTransaction')(sequelize, Sequelize.DataTypes);
db.CustomerWallet = require('./customerWallet')(sequelize, Sequelize.DataTypes);
db.InvestmentApplication = require('./investmentApplication')(sequelize, Sequelize.DataTypes);
db.LoanApplication = require('./loanApplication')(sequelize, Sequelize.DataTypes);
db.Repayment = require('./repayment')(sequelize, Sequelize.DataTypes);

// Define associations
db.Merchant.hasMany(db.Agent, { foreignKey: 'merchantId' });
db.Agent.belongsTo(db.Merchant, { foreignKey: 'merchantId' });

db.Merchant.hasMany(db.Branch, { foreignKey: 'merchantId' });
db.Branch.belongsTo(db.Merchant, { foreignKey: 'merchantId' });

db.Merchant.hasMany(db.Customer, { foreignKey: 'merchantId' });
db.Customer.belongsTo(db.Merchant, { foreignKey: 'merchantId' });

db.Merchant.hasMany(db.Staff, { foreignKey: 'merchantId' });
db.Staff.belongsTo(db.Merchant, { foreignKey: 'merchantId' });

db.Branch.hasMany(db.Agent, { foreignKey: 'branchId' });
db.Agent.belongsTo(db.Branch, { foreignKey: 'branchId' });

db.Branch.hasMany(db.Customer, { foreignKey: 'branchId' });
db.Customer.belongsTo(db.Branch, { foreignKey: 'branchId' });

db.Branch.hasMany(db.Staff, { foreignKey: 'branchId' });
db.Staff.belongsTo(db.Branch, { foreignKey: 'branchId' });

db.Agent.hasMany(db.Customer, { foreignKey: 'agentId' });
db.Customer.belongsTo(db.Agent, { foreignKey: 'agentId' });

db.Role.hasMany(db.Staff, { foreignKey: 'roleId' });
db.Staff.belongsTo(db.Role, { foreignKey: 'roleId' });

// Charge associations
db.Merchant.hasMany(db.Charge, { foreignKey: 'merchantId' });
db.Charge.belongsTo(db.Merchant, { foreignKey: 'merchantId' });

db.Charge.hasMany(db.ChargeAssignment, { foreignKey: 'charge_id' });
db.ChargeAssignment.belongsTo(db.Charge, { foreignKey: 'charge_id' });

db.Customer.hasMany(db.ChargeAssignment, { foreignKey: 'customer_id' });
db.ChargeAssignment.belongsTo(db.Customer, { foreignKey: 'customer_id' });

db.Merchant.hasMany(db.ChargeAssignment, { foreignKey: 'merchant_id' });
db.ChargeAssignment.belongsTo(db.Merchant, { foreignKey: 'merchant_id' });

// Loan associations
db.Merchant.hasMany(db.Loan, { foreignKey: 'merchantId' });
db.Loan.belongsTo(db.Merchant, { foreignKey: 'merchantId' });

db.Customer.hasMany(db.Loan, { foreignKey: 'customerId' });
db.Loan.belongsTo(db.Customer, { foreignKey: 'customerId' });

// Investment associations
db.Merchant.hasMany(db.Investment, { foreignKey: 'merchantId' });
db.Investment.belongsTo(db.Merchant, { foreignKey: 'merchantId' });

db.Customer.hasMany(db.Investment, { foreignKey: 'customerId' });
db.Investment.belongsTo(db.Customer, { foreignKey: 'customerId' });

// Package associations
db.Merchant.hasMany(db.Package, { foreignKey: 'merchantId' });
db.Package.belongsTo(db.Merchant, { foreignKey: 'merchantId' });

// Customer ↔ Package associations
db.Package.hasMany(db.Customer, { foreignKey: 'packageId' });
db.Customer.belongsTo(db.Package, { foreignKey: 'packageId' });

// Collection associations
db.Merchant.hasMany(db.Collection, { foreignKey: 'merchantId' });
db.Collection.belongsTo(db.Merchant, { foreignKey: 'merchantId' });

db.Customer.hasMany(db.Collection, { foreignKey: 'customerId' });
db.Collection.belongsTo(db.Customer, { foreignKey: 'customerId' });

// Wallet Transaction associations
db.Merchant.hasMany(db.WalletTransaction, { foreignKey: 'merchantId' });
db.WalletTransaction.belongsTo(db.Merchant, { foreignKey: 'merchantId' });

// Customer Wallet associations - defined in individual model files

// Investment Application associations - defined in individual model files

// Loan Application associations
db.Merchant.hasMany(db.LoanApplication, { foreignKey: 'merchantId' });
db.LoanApplication.belongsTo(db.Merchant, { foreignKey: 'merchantId' });

db.Customer.hasMany(db.LoanApplication, { foreignKey: 'customerId' });
db.LoanApplication.belongsTo(db.Customer, { foreignKey: 'customerId' });

db.Agent.hasMany(db.LoanApplication, { foreignKey: 'agentId' });
db.LoanApplication.belongsTo(db.Agent, { foreignKey: 'agentId' });

db.Staff.hasMany(db.LoanApplication, { foreignKey: 'approvedBy' });
db.LoanApplication.belongsTo(db.Staff, { foreignKey: 'approvedBy' });

// Loan associations (updated)
db.Merchant.hasMany(db.Loan, { foreignKey: 'merchantId' });
db.Loan.belongsTo(db.Merchant, { foreignKey: 'merchantId' });

db.Customer.hasMany(db.Loan, { foreignKey: 'customerId' });
db.Loan.belongsTo(db.Customer, { foreignKey: 'customerId' });

db.Agent.hasMany(db.Loan, { foreignKey: 'agentId' });
db.Loan.belongsTo(db.Agent, { foreignKey: 'agentId' });

db.Staff.hasMany(db.Loan, { foreignKey: 'approvedBy' });
db.Loan.belongsTo(db.Staff, { foreignKey: 'approvedBy' });

// Repayment associations
db.Loan.hasMany(db.Repayment, { foreignKey: 'loanId' });
db.Repayment.belongsTo(db.Loan, { foreignKey: 'loanId' });

db.Merchant.hasMany(db.Repayment, { foreignKey: 'merchantId' });
db.Repayment.belongsTo(db.Merchant, { foreignKey: 'merchantId' });

db.Customer.hasMany(db.Repayment, { foreignKey: 'customerId' });
db.Repayment.belongsTo(db.Customer, { foreignKey: 'customerId' });

db.Agent.hasMany(db.Repayment, { foreignKey: 'agentId' });
db.Repayment.belongsTo(db.Agent, { foreignKey: 'agentId' });

// Call associate functions for all models
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
