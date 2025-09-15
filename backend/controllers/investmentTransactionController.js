const { InvestmentTransaction, Customer, Merchant } = require('../models');
const { Op } = require('sequelize');

// Create a new investment transaction
const createInvestmentTransaction = async (req, res) => {
  try {
    const { 
      customer, 
      accountNumber, 
      package, 
      amount, 
      branch, 
      agent, 
      transactionType, 
      notes 
    } = req.body;
    
    const merchantId = req.user.id;

    // Find customer by name
    const customerRecord = await Customer.findOne({
      where: {
        fullName: customer,
        merchantId: merchantId
      }
    });

    if (!customerRecord) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const transaction = await InvestmentTransaction.create({
      customerId: customerRecord.id,
      customer,
      accountNumber: accountNumber || customerRecord.accountNumber,
      package: package || '',
      amount: parseFloat(amount),
      branch: branch || '',
      agent: agent || '',
      transactionType,
      notes: notes || '',
      merchantId,
      status: 'completed' // Default to completed for now
    });

    res.status(201).json({
      success: true,
      message: 'Investment transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Error creating investment transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create investment transaction',
      error: error.message
    });
  }
};

// Get all investment transactions for a merchant
const getInvestmentTransactions = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { 
      status, 
      search, 
      fromDate, 
      toDate, 
      page = 1, 
      limit = 10,
      agentId,
      branch,
      transactionType
    } = req.query;

    const whereClause = { merchantId };
    
    // Add filters
    if (status) {
      whereClause.status = status;
    }
    
    if (transactionType) {
      whereClause.transactionType = transactionType;
    }
    
    if (branch) {
      whereClause.branch = { [Op.iLike]: `%${branch}%` };
    }
    
    if (agentId) {
      whereClause.agent = { [Op.iLike]: `%${agentId}%` };
    }
    
    if (search) {
      whereClause[Op.or] = [
        { customer: { [Op.iLike]: `%${search}%` } },
        { accountNumber: { [Op.iLike]: `%${search}%` } },
        { package: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (fromDate && toDate) {
      whereClause.transactionDate = {
        [Op.between]: [new Date(fromDate), new Date(toDate)]
      };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { count, rows: transactions } = await InvestmentTransaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          attributes: ['id', 'fullName', 'email', 'phoneNumber']
        }
      ],
      order: [['transactionDate', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      transactions,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching investment transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investment transactions',
      error: error.message
    });
  }
};

// Get investment transaction by ID
const getInvestmentTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const transaction = await InvestmentTransaction.findOne({
      where: { 
        id: id,
        merchantId: merchantId 
      },
      include: [
        {
          model: Customer,
          attributes: ['id', 'fullName', 'email', 'phoneNumber']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Investment transaction not found'
      });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error fetching investment transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investment transaction',
      error: error.message
    });
  }
};

// Update investment transaction
const updateInvestmentTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;
    const updateData = req.body;

    const transaction = await InvestmentTransaction.findOne({
      where: { 
        id: id,
        merchantId: merchantId 
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Investment transaction not found'
      });
    }

    // Update transaction
    await transaction.update(updateData);

    res.json({
      success: true,
      message: 'Investment transaction updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Error updating investment transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update investment transaction',
      error: error.message
    });
  }
};

// Delete investment transaction
const deleteInvestmentTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const transaction = await InvestmentTransaction.findOne({
      where: { 
        id: id,
        merchantId: merchantId 
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Investment transaction not found'
      });
    }

    await transaction.destroy();

    res.json({
      success: true,
      message: 'Investment transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting investment transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete investment transaction',
      error: error.message
    });
  }
};

module.exports = {
  createInvestmentTransaction,
  getInvestmentTransactions,
  getInvestmentTransactionById,
  updateInvestmentTransaction,
  deleteInvestmentTransaction
};
