const { CustomerWallet, Customer, Merchant } = require('../models');
const { Op } = require('sequelize');

// Get all customer wallets for a merchant
const getCustomerWallets = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { page = 1, limit = 10, search, accountLevel, status } = req.query;

    const whereClause = { merchantId };
    
    if (search) {
      whereClause[Op.or] = [
        { accountNumber: { [Op.iLike]: `%${search}%` } },
        { '$customer.fullName$': { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (accountLevel) {
      whereClause.accountLevel = accountLevel;
    }
    
    if (status) {
      whereClause.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: wallets } = await CustomerWallet.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'phoneNumber', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      wallets,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching customer wallets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer wallets',
      error: error.message
    });
  }
};

// Get customer wallet by ID
const getCustomerWalletById = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const wallet = await CustomerWallet.findOne({
      where: { 
        id,
        merchantId 
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'phoneNumber', 'email']
        }
      ]
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Customer wallet not found'
      });
    }

    res.json({
      success: true,
      wallet
    });
  } catch (error) {
    console.error('Error fetching customer wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer wallet',
      error: error.message
    });
  }
};

// Create a new customer wallet
const createCustomerWallet = async (req, res) => {
  try {
    const { customerId, accountNumber, accountLevel, balance, notes } = req.body;
    const merchantId = req.user.id;

    // Check if customer exists and belongs to this merchant
    const customer = await Customer.findOne({
      where: { 
        id: customerId,
        merchantId 
      }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if customer already has a wallet
    const existingWallet = await CustomerWallet.findOne({
      where: { 
        customerId,
        merchantId 
      }
    });

    if (existingWallet) {
      return res.status(400).json({
        success: false,
        message: 'Customer already has a wallet'
      });
    }

    const wallet = await CustomerWallet.create({
      customerId,
      merchantId,
      accountNumber,
      accountLevel: accountLevel || 'Tier 1',
      balance: balance || 0.00,
      notes: notes || '',
      activationDate: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Customer wallet created successfully',
      wallet
    });
  } catch (error) {
    console.error('Error creating customer wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer wallet',
      error: error.message
    });
  }
};

// Update customer wallet
const updateCustomerWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountLevel, balance, status, notes } = req.body;
    const merchantId = req.user.id;

    const wallet = await CustomerWallet.findOne({
      where: { 
        id,
        merchantId 
      }
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Customer wallet not found'
      });
    }

    await wallet.update({
      accountLevel: accountLevel || wallet.accountLevel,
      balance: balance !== undefined ? balance : wallet.balance,
      status: status || wallet.status,
      notes: notes || wallet.notes,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Customer wallet updated successfully',
      wallet
    });
  } catch (error) {
    console.error('Error updating customer wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer wallet',
      error: error.message
    });
  }
};

// Delete customer wallet
const deleteCustomerWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const wallet = await CustomerWallet.findOne({
      where: { 
        id,
        merchantId 
      }
    });

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Customer wallet not found'
      });
    }

    await wallet.destroy();

    res.json({
      success: true,
      message: 'Customer wallet deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer wallet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer wallet',
      error: error.message
    });
  }
};

// Get customer wallet statistics
const getCustomerWalletStats = async (req, res) => {
  try {
    const merchantId = req.user.id;

    const [totalWallets, activeWallets, totalBalance] = await Promise.all([
      CustomerWallet.count({ where: { merchantId } }),
      CustomerWallet.count({ where: { merchantId, status: 'Active' } }),
      CustomerWallet.sum('balance', { where: { merchantId, status: 'Active' } })
    ]);

    // Get wallets by account level
    const walletsByLevel = await CustomerWallet.findAll({
      where: { merchantId },
      attributes: [
        'accountLevel',
        [CustomerWallet.sequelize.fn('COUNT', CustomerWallet.sequelize.col('id')), 'count'],
        [CustomerWallet.sequelize.fn('SUM', CustomerWallet.sequelize.col('balance')), 'totalBalance']
      ],
      group: ['accountLevel']
    });

    res.json({
      success: true,
      stats: {
        totalWallets,
        activeWallets,
        suspendedWallets: totalWallets - activeWallets,
        totalBalance: totalBalance || 0,
        walletsByLevel
      }
    });
  } catch (error) {
    console.error('Error fetching customer wallet stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer wallet statistics',
      error: error.message
    });
  }
};

module.exports = {
  getCustomerWallets,
  getCustomerWalletById,
  createCustomerWallet,
  updateCustomerWallet,
  deleteCustomerWallet,
  getCustomerWalletStats
};
