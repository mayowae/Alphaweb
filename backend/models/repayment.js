const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Repayment = sequelize.define('Repayment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    transactionId: { type: DataTypes.STRING, allowNull: false, unique: true, comment: 'Unique transaction ID' },
    loanId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'loans', key: 'id' } },
    customerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'customers', key: 'id' } },
    customerName: { type: DataTypes.STRING, allowNull: false },
    accountNumber: { type: DataTypes.STRING, allowNull: true, comment: 'Customer account number' },
    package: { type: DataTypes.STRING, allowNull: true, comment: 'Loan package name' },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, comment: 'Repayment amount' },
    branch: { type: DataTypes.STRING, allowNull: true, comment: 'Branch where repayment was made' },
    agentId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'agents', key: 'id' } },
    agentName: { type: DataTypes.STRING, allowNull: true, comment: 'Agent who processed the repayment' },
    merchantId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'merchants', key: 'id' } },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, comment: 'Date of repayment' },
    status: { type: DataTypes.ENUM('Pending', 'Completed', 'Failed'), defaultValue: 'Pending' },
    paymentMethod: { type: DataTypes.STRING, allowNull: true, comment: 'Method of payment' },
    reference: { type: DataTypes.STRING, allowNull: true, comment: 'Payment reference number' },
    notes: { type: DataTypes.TEXT, allowNull: true, comment: 'Additional notes' }
  }, {
    tableName: 'repayments',
    timestamps: true,
    indexes: [
      { fields: ['merchant_id'] },
      { fields: ['loan_id'] },
      { fields: ['customer_id'] },
      { fields: ['date'] },
      { fields: ['status'] },
      { fields: ['transaction_id'] }
    ]
  });

  Repayment.associate = (models) => {
    Repayment.belongsTo(models.Loan, { foreignKey: 'loanId', as: 'loan' });
    Repayment.belongsTo(models.Customer, { foreignKey: 'customerId', as: 'customer' });
    Repayment.belongsTo(models.Agent, { foreignKey: 'agentId', as: 'agent' });
    Repayment.belongsTo(models.Merchant, { foreignKey: 'merchantId', as: 'merchant' });
  };

  return Repayment;
};
