const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Loan = sequelize.define('Loan', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customerId: { type: DataTypes.INTEGER, allowNull: false, field: 'customer_id', references: { model: 'customers', key: 'id' } },
    customerName: { type: DataTypes.STRING, allowNull: false, field: 'customer_name' },
    accountNumber: { type: DataTypes.STRING, allowNull: true, field: 'account_number', comment: 'Customer account number' },
    loanAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, field: 'loan_amount', comment: 'Original loan amount' },
    interestRate: { type: DataTypes.DECIMAL(5, 2), allowNull: false, field: 'interest_rate', comment: 'Interest rate percentage' },
    duration: { type: DataTypes.INTEGER, allowNull: false, comment: 'Duration in days' },
    agentId: { type: DataTypes.INTEGER, allowNull: true, field: 'agent_id', references: { model: 'agents', key: 'id' } },
    agentName: { type: DataTypes.STRING, allowNull: true, field: 'agent_name', comment: 'Agent handling the loan' },
    branch: { type: DataTypes.STRING, allowNull: true, comment: 'Branch where loan was processed' },
    status: { type: DataTypes.ENUM('Active', 'Completed', 'Defaulted', 'Pending'), defaultValue: 'Pending' },
    merchantId: { type: DataTypes.INTEGER, allowNull: false, field: 'merchant_id', references: { model: 'merchants', key: 'id' } },
    dateIssued: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'date_issued' },
    dueDate: { type: DataTypes.DATE, allowNull: false, field: 'due_date', comment: 'Loan due date' },
    notes: { type: DataTypes.TEXT, allowNull: true, comment: 'Additional notes or comments' },
    approvedBy: { type: DataTypes.INTEGER, allowNull: true, field: 'approved_by', references: { model: 'staff', key: 'id' } },
    approvedAt: { type: DataTypes.DATE, allowNull: true, field: 'approved_at' },
    totalAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, field: 'total_amount', comment: 'Total amount including interest' },
    amountPaid: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0, field: 'amount_paid', comment: 'Total amount paid so far' },
    remainingAmount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, field: 'remaining_amount', comment: 'Remaining amount to be paid' }
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
