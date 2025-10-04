const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Loan = sequelize.define('Loan', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'customers', key: 'id' } },
    customerName: { type: DataTypes.STRING, allowNull: false },
    accountNumber: { type: DataTypes.STRING, allowNull: true, comment: 'Customer account number' },
    loanAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, comment: 'Original loan amount' },
    interestRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, comment: 'Interest rate percentage' },
    duration: { type: DataTypes.INTEGER, allowNull: false, comment: 'Duration in days' },
    agentId: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'agents', key: 'id' } },
    agentName: { type: DataTypes.STRING, allowNull: true, comment: 'Agent handling the loan' },
    branch: { type: DataTypes.STRING, allowNull: true, comment: 'Branch where loan was processed' },
    status: { type: DataTypes.ENUM('Active', 'Completed', 'Defaulted', 'Pending'), defaultValue: 'Pending' },
    merchantId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'merchants', key: 'id' } },
    dateIssued: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    dueDate: { type: DataTypes.DATE, allowNull: false, comment: 'Loan due date' },
    notes: { type: DataTypes.TEXT, allowNull: true, comment: 'Additional notes or comments' },
    approvedBy: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'staff', key: 'id' } },
    approvedAt: { type: DataTypes.DATE, allowNull: true },
    totalAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, comment: 'Total amount including interest' },
    amountPaid: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0, comment: 'Total amount paid so far' },
    remainingAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, comment: 'Remaining amount to be paid' }
  }, {
    tableName: 'loans',
    timestamps: true,
    indexes: [
      { fields: ['merchant_id'] },
      { fields: ['customer_id'] },
      { fields: ['status'] },
      { fields: ['date_issued'] },
      { fields: ['due_date'] }
    ]
  });

  Loan.associate = (models) => {
    Loan.belongsTo(models.Customer, { foreignKey: 'customerId', as: 'customer' });
    Loan.belongsTo(models.Agent, { foreignKey: 'agentId', as: 'agent' });
    Loan.belongsTo(models.Merchant, { foreignKey: 'merchantId', as: 'merchant' });
    Loan.belongsTo(models.Staff, { foreignKey: 'approvedBy', as: 'approver' });
  };

  return Loan;
};
