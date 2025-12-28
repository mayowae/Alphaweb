const { WalletTransaction, Merchant } = require('../models');
const { Op } = require('sequelize');

/**
 * @swagger
 * tags:
 *   - name: Wallet
 *     description: Merchant wallet operations
 * /wallet/balance:
 *   get:
 *     summary: Get merchant wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               balance: 50000.00
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * /wallet/transactions:
 *   get:
 *     summary: List wallet transactions
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: 
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: 
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: type
 *         schema: 
 *           type: string
 *           enum: [credit, debit]
 *         description: Transaction type
 *       - in: query
 *         name: status
 *         schema: 
 *           type: string
 *         description: Transaction status
 *     responses:
 *       200:
 *         description: Transactions list retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               transactions:
 *                 - id: 9001
 *                   type: "credit"
 *                   transactionType: "credit"
 *                   amount: 2000.00
 *                   status: "Completed"
 *                   reference: "TXN123456"
 *                   description: "Payment received from customer"
 *                   merchantId: 1
 *                   paymentMethod: "Bank Transfer"
 *                   relatedId: 123
 *                   relatedType: "customer_wallet"
 *                   notes: "Transaction processed successfully"
 *                   balanceBefore: 5000.00
 *                   balanceAfter: 7000.00
 *                   category: "Collection"
 *                   processedBy: 2
 *                   date: "2024-01-15T10:30:00.000Z"
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                   updatedAt: "2024-01-15T10:30:00.000Z"
 *               pagination:
 *                 currentPage: 1
 *                 totalPages: 2
 *                 totalItems: 12
 *                 itemsPerPage: 10
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create wallet transaction
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, amount]
 *             properties:
 *               type: 
 *                 type: string
 *                 enum: [credit, debit]
 *                 description: Transaction type
 *                 example: "credit"
 *               amount: 
 *                 type: number
 *                 format: float
 *                 description: Transaction amount
 *                 example: 1000.00
 *               description: 
 *                 type: string
 *                 description: Transaction description
 *                 example: "Payment received"
 *               reference: 
 *                 type: string
 *                 description: Transaction reference
 *                 example: "TXN123456"
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Transaction created successfully"
 *               transaction:
 *                 id: 9002
 *                 type: "debit"
 *                 transactionType: "debit"
 *                 amount: 1500.00
 *                 status: "Pending"
 *                 reference: "TXN123457"
 *                 description: "Payment made to supplier"
 *                 merchantId: 1
 *                 paymentMethod: "Bank Transfer"
 *                 relatedId: 124
 *                 relatedType: "supplier_payment"
 *                 notes: "Monthly supplier payment"
 *                 balanceBefore: 7000.00
 *                 balanceAfter: 5500.00
 *                 category: "Payment"
 *                 processedBy: 2
 *                 date: "2024-01-15T10:30:00.000Z"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * /wallet/transactions/{id}:
 *   get:
 *     summary: Get wallet transaction by ID
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: 
 *           type: integer
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               transaction:
 *                 id: 9001
 *                 type: "credit"
 *                 transactionType: "credit"
 *                 amount: 2000.00
 *                 status: "Completed"
 *                 reference: "TXN123456"
 *                 description: "Payment received from customer"
 *                 merchantId: 1
 *                 paymentMethod: "Bank Transfer"
 *                 relatedId: 123
 *                 relatedType: "customer_wallet"
 *                 notes: "Transaction processed successfully"
 *                 balanceBefore: 5000.00
 *                 balanceAfter: 7000.00
 *                 category: "Collection"
 *                 processedBy: 2
 *                 date: "2024-01-15T10:30:00.000Z"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * /wallet/transactions/{id}/status:
 *   put:
 *     summary: Update wallet transaction status
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: 
 *           type: integer
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: 
 *                 type: string
 *                 description: New transaction status
 *                 example: "completed"
 *               notes: 
 *                 type: string
 *                 description: Additional notes
 *                 example: "Transaction processed successfully"
 *     responses:
 *       200:
 *         description: Transaction status updated successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Transaction status updated successfully"
 *               transaction:
 *                 id: 9001
 *                 status: "completed"
 *       404:
 *         description: Transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * /wallet/stats:
 *   get:
 *     summary: Get wallet statistics
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema: 
 *           type: integer
 *           default: 30
 *         description: Period in days
 *     responses:
 *       200:
 *         description: Wallet statistics retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               stats:
 *                 totalBalance: 50000.00
 *                 totalCredits: 75000.00
 *                 totalDebits: 25000.00
 *                 transactionCount: 150
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * /wallet/transfer:
 *   post:
 *     summary: Transfer funds to customer wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerId, amount]
 *             properties:
 *               customerId: 
 *                 type: integer
 *                 description: Customer ID
 *                 example: 1
 *               amount: 
 *                 type: number
 *                 format: float
 *                 description: Transfer amount
 *                 example: 1000.00
 *               description: 
 *                 type: string
 *                 description: Transfer description
 *                 example: "Fund transfer to customer"
 *               transactionType: 
 *                 type: string
 *                 enum: [credit, debit]
 *                 description: Transaction type
 *                 example: "debit"
 *               type: 
 *                 type: string
 *                 enum: [credit, debit]
 *                 description: Transaction type
 *                 example: "debit"
 *               paymentMethod: 
 *                 type: string
 *                 description: Payment method
 *                 example: "Bank Transfer"
 *     responses:
 *       200:
 *         description: Transfer completed successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Transfer completed successfully"
 *               transaction:
 *                 id: 9010
 *                 type: "debit"
 *                 amount: 1000
 *                 status: "completed"
 *       400:
 *         description: Invalid input or insufficient funds
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// Get wallet balance for a merchant
const getWalletBalance = async (req, res) => {
  try {
    const merchantId = req.user.id;

    // Calculate balance from all transactions
    const transactions = await WalletTransaction.findAll({
      where: { merchantId },
      attributes: ['type', 'transactionType', 'amount', 'status']
    });

    let totalBalance = 0;
    let availableBalance = 0;
    let pendingAmount = 0;

    transactions.forEach(transaction => {
      if (transaction.status === 'Completed') {
        // Simplified balance calculation: Always deduct debit transactions
        // Credit transactions increase balance, Debit transactions decrease balance
        if (transaction.transactionType === 'credit') {
          // Credit increases merchant's wallet balance
          totalBalance += parseFloat(transaction.amount);
          availableBalance += parseFloat(transaction.amount);
        } else if (transaction.transactionType === 'debit') {
          // Debit decreases merchant's wallet balance
          totalBalance -= parseFloat(transaction.amount);
          availableBalance -= parseFloat(transaction.amount);
        } else if (transaction.transactionType === 'initial_balance') {
          // Initial balance increases merchant's wallet
          totalBalance += parseFloat(transaction.amount);
          availableBalance += parseFloat(transaction.amount);
        } else {
          // Fallback to old logic for transactions without transactionType
          if (transaction.type === 'credit') {
            totalBalance += parseFloat(transaction.amount);
            availableBalance += parseFloat(transaction.amount);
          } else if (transaction.type === 'debit') {
            totalBalance -= parseFloat(transaction.amount);
            availableBalance -= parseFloat(transaction.amount);
          }
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
      order: [['createdAt', 'DESC']],
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
        attributes: ['type', 'transactionType', 'amount', 'status']
      });

      let merchantBalance = 0;
      merchantTransactions.forEach(transaction => {
        if (transaction.status === 'Completed') {
          // Use the same logic as getWalletBalance for consistency
          // Always deduct debit transactions, add credit transactions
          if (transaction.transactionType === 'credit') {
            // Credit increases merchant's wallet balance
            merchantBalance += parseFloat(transaction.amount);
          } else if (transaction.transactionType === 'debit') {
            // Debit decreases merchant's wallet balance
            merchantBalance -= parseFloat(transaction.amount);
          } else if (transaction.transactionType === 'initial_balance') {
            // Initial balance increases merchant's wallet
            merchantBalance += parseFloat(transaction.amount);
          } else {
            // Fallback to old logic for transactions without transactionType
            if (transaction.type === 'credit') {
              merchantBalance += parseFloat(transaction.amount);
            } else if (transaction.type === 'debit') {
              merchantBalance -= parseFloat(transaction.amount);
            }
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

