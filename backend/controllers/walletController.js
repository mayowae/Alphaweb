const { WalletTransaction, Merchant } = require('../models');
const { Op } = require('sequelize');

// Get wallet balance for a merchant
const getWalletBalance = async (req, res) => {
  try {
    const merchantId = req.user.id;

    // Calculate balance from all transactions
    const transactions = await WalletTransaction.findAll({
      where: { merchantId },
      attributes: ['type', 'amount', 'status']
    });

    let totalBalance = 0;
    let availableBalance = 0;
    let pendingAmount = 0;

    transactions.forEach(transaction => {
      if (transaction.status === 'Completed') {
        if (transaction.type === 'credit') {
          totalBalance += parseFloat(transaction.amount);
          availableBalance += parseFloat(transaction.amount);
        } else if (transaction.type === 'debit') {
          totalBalance -= parseFloat(transaction.amount);
          availableBalance -= parseFloat(transaction.amount);
        }
      } else if (transaction.status === 'Pending') {
        pendingAmount += parseFloat(transaction.amount);
      }
    });

    res.json({
      success: true,
      balance: {
        total: totalBalance,
        available: availableBalance,
        pending: pendingAmount,
        currency: 'NGN'
      }
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet balance',
      error: error.message
    });
  }
};

// Create a new wallet transaction
const createWalletTransaction = async (req, res) => {
  try {
    const { type, amount, description, reference } = req.body;
    const merchantId = req.user.id;

    const transaction = await WalletTransaction.create({
      merchantId,
      type,
      amount: parseFloat(amount),
      description: description || '',
      reference: reference || `TXN_${Date.now()}`,
      status: 'Completed', // For now, all transactions are immediately completed
      date: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Wallet transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Error creating wallet transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create wallet transaction',
      error: error.message
    });
  }
};

// Get all wallet transactions for a merchant
const getWalletTransactions = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { page = 1, limit = 10, type, status } = req.query;

    const whereClause = { merchantId };
    
    if (type) {
      whereClause.type = type;
    }
    
    if (status) {
      whereClause.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: transactions } = await WalletTransaction.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      transactions,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet transactions',
      error: error.message
    });
  }
};

// Get wallet transaction by ID
const getWalletTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const transaction = await WalletTransaction.findOne({
      where: { 
        id,
        merchantId 
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error fetching wallet transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet transaction',
      error: error.message
    });
  }
};

// Update wallet transaction status
const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const merchantId = req.user.id;

    const transaction = await WalletTransaction.findOne({
      where: { 
        id,
        merchantId 
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    await transaction.update({
      status,
      notes: notes || transaction.notes,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction status',
      error: error.message
    });
  }
};

// Get wallet statistics
const getWalletStats = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { period = '30' } = req.query; // Default to last 30 days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const transactions = await WalletTransaction.findAll({
      where: {
        merchantId,
        date: {
          [Op.gte]: startDate
        },
        status: 'Completed'
      }
    });

    let totalCredits = 0;
    let totalDebits = 0;
    let transactionCount = transactions.length;

    transactions.forEach(transaction => {
      if (transaction.type === 'Credit' || transaction.type === 'Deposit') {
        totalCredits += parseFloat(transaction.amount);
      } else if (transaction.type === 'Debit' || transaction.type === 'Withdrawal') {
        totalDebits += parseFloat(transaction.amount);
      }
    });

    res.json({
      success: true,
      stats: {
        period: `Last ${period} days`,
        totalCredits,
        totalDebits,
        netAmount: totalCredits - totalDebits,
        transactionCount,
        averageTransaction: transactionCount > 0 ? (totalCredits + totalDebits) / transactionCount : 0
      }
    });
  } catch (error) {
    console.error('Error fetching wallet stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet statistics',
      error: error.message
    });
  }
};

// Transfer from merchant wallet to customer wallet
const transferToCustomer = async (req, res) => {
  try {
    const { customerId, amount, description, transactionType, type, paymentMethod } = req.body;
    const merchantId = req.user.id;

    // Validate required fields
    if (!customerId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID and valid amount are required'
      });
    }

    // Check if customer exists and has a wallet
    const { CustomerWallet, Customer } = require('../models');
    
    const customerWallet = await CustomerWallet.findOne({
      where: { 
        customerId,
        merchantId 
      },
      include: [{
        model: Customer,
        as: 'customer',
        attributes: ['id', 'fullName']
      }]
    });

    if (!customerWallet) {
      return res.status(404).json({
        success: false,
        message: 'Customer wallet not found'
      });
    }

    // For merchant debit (payout) ensure sufficient merchant balance; skip for merchant credit (inflow)
    if ((type === 'debit') || !type) {
      const merchantTransactions = await WalletTransaction.findAll({
        where: { merchantId },
        attributes: ['type', 'amount', 'status']
      });

      let merchantBalance = 0;
      merchantTransactions.forEach(transaction => {
        if (transaction.status === 'Completed') {
          if (transaction.type === 'credit') {
            merchantBalance += parseFloat(transaction.amount);
          } else if (transaction.type === 'debit') {
            merchantBalance -= parseFloat(transaction.amount);
          }
        }
      });

      if (merchantBalance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance in merchant wallet'
        });
      }
    }

    // Create debit transaction for merchant wallet
    const customerSideType = (type === 'credit' || type === 'debit') ? type : 'debit';
    const merchantSideType = customerSideType === 'credit' ? 'debit' : 'credit';

    const merchantTransaction = await WalletTransaction.create({
      merchantId,
      type: merchantSideType,
      transactionType: customerSideType,
      amount: parseFloat(amount),
      description: `Transfer ${customerSideType === 'credit' ? 'to' : 'from'} ${customerWallet.customer.fullName}: ${description || 'Wallet transaction'}`,
      reference: `TRF_${Date.now()}`,
      status: 'Completed',
      date: new Date(),
      relatedId: customerWallet.id,
      relatedType: 'customer_wallet',
      paymentMethod: paymentMethod || null
    });

    // Update customer wallet balance
    await customerWallet.update({
      balance: parseFloat(customerWallet.balance) + (customerSideType === 'credit' ? parseFloat(amount) : -parseFloat(amount)),
      lastTransactionDate: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Transfer completed successfully',
      transfer: {
        id: merchantTransaction.id,
        amount,
        customerName: customerWallet.customer.fullName,
        reference: merchantTransaction.reference,
        date: merchantTransaction.date
      }
    });
  } catch (error) {
    console.error('Error transferring to customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete transfer',
      error: error.message
    });
  }
};

module.exports = {
  getWalletBalance,
  createWalletTransaction,
  getWalletTransactions,
  getWalletTransactionById,
  updateTransactionStatus,
  getWalletStats,
  transferToCustomer
};
