const { Package } = require('../models');
const { Op } = require('sequelize');

// Create a new package
const createPackage = async (req, res) => {
  try {
    const { 
      name, 
      type, 
      amount, 
      seedAmount, 
      seedType, 
      period, 
      collectionDays, 
      duration, 
      benefits, 
      description,
      interestRate,
      extraCharges,
      defaultPenalty,
      defaultDays,
      // Loan-specific fields
      loanAmount,
      loanInterestRate,
      loanPeriod,
      defaultAmount,
      gracePeriod,
      loanCharges,
      packageCategory
    } = req.body;
    const merchantIdRaw = (req.user && (req.user.id || req.user.merchantId)) || req.body.merchantId;
    const merchantId = merchantIdRaw ? parseInt(merchantIdRaw, 10) : null;
    if (!merchantId) {
      return res.status(400).json({ success: false, message: 'Missing merchantId', error: 'merchantId is required' });
    }

    const packageData = await Package.create({
      name,
      type: type || 'Fixed',
      amount: parseFloat(amount),
      seedAmount: seedAmount ? parseFloat(seedAmount) : parseFloat(amount),
      seedType: seedType || 'First saving',
      period: parseInt(period) || parseInt(duration) || 360,
      collectionDays: collectionDays || 'Daily',
      duration: parseInt(duration),
      benefits: Array.isArray(benefits) ? benefits : [benefits],
      description: description || '',
      status: 'Active',
      merchantId,
      dateCreated: new Date(),
      interestRate: interestRate ? parseFloat(interestRate) : null,
      extraCharges: extraCharges ? parseFloat(extraCharges) : 0.00,
      defaultPenalty: defaultPenalty ? parseFloat(defaultPenalty) : 0.00,
      defaultDays: defaultDays ? parseInt(defaultDays) : 0,
      // Loan-specific fields
      loanAmount: loanAmount ? parseFloat(loanAmount) : null,
      loanInterestRate: loanInterestRate ? parseFloat(loanInterestRate) : null,
      loanPeriod: loanPeriod ? parseInt(loanPeriod) : null,
      defaultAmount: defaultAmount ? parseFloat(defaultAmount) : 0.00,
      gracePeriod: gracePeriod ? parseInt(gracePeriod) : 0,
      loanCharges: loanCharges ? parseFloat(loanCharges) : 0.00,
      packageCategory: packageCategory || 'Investment'
    });

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      package: packageData
    });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create package',
      error: error.message
    });
  }
};

// Get all packages for a merchant
const getPackages = async (req, res) => {
  try {
    const merchantIdRaw = (req.user && (req.user.id || req.user.merchantId)) || req.query.merchantId || req.body.merchantId;
    const merchantId = merchantIdRaw ? parseInt(merchantIdRaw, 10) : null;
    if (!merchantId) {
      return res.status(400).json({ success: false, message: 'Missing merchantId', error: 'merchantId is required' });
    }
    const { category, type, status } = req.query;

    let whereClause = { 
      merchantId,
      status: { [Op.ne]: 'Deleted' }
    };

    // Add category filter if provided
    if (category) {
      whereClause.packageCategory = category;
    }

    // Add type filter if provided
    if (type) {
      whereClause.type = type;
    }

    // Add status filter if provided
    if (status) {
      whereClause.status = status;
    }

    const packages = await Package.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      packages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages',
      error: error.message
    });
  }
};

// Get package by ID
const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantIdRaw = (req.user && (req.user.id || req.user.merchantId)) || req.body.merchantId;
    const merchantId = merchantIdRaw ? parseInt(merchantIdRaw, 10) : null;
    if (!merchantId) {
      return res.status(400).json({ success: false, message: 'Missing merchantId', error: 'merchantId is required' });
    }

    const packageData = await Package.findOne({
      where: { 
        id,
        merchantId,
        status: { [Op.ne]: 'Deleted' }
      }
    });

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.json({
      success: true,
      package: packageData
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch package',
      error: error.message
    });
  }
};

// Update package
const updatePackage = async (req, res) => {
  try {
    const { 
      id, 
      name, 
      type, 
      amount, 
      seedAmount, 
      seedType, 
      period, 
      collectionDays, 
      duration, 
      benefits, 
      description, 
      status,
      interestRate,
      extraCharges,
      defaultPenalty,
      defaultDays,
      // Loan-specific fields
      loanAmount,
      loanInterestRate,
      loanPeriod,
      defaultAmount,
      gracePeriod,
      loanCharges,
      packageCategory
    } = req.body;
    const merchantIdRaw = (req.user && (req.user.id || req.user.merchantId)) || req.body.merchantId;
    const merchantId = merchantIdRaw ? parseInt(merchantIdRaw, 10) : null;
    if (!merchantId) {
      return res.status(400).json({ success: false, message: 'Missing merchantId', error: 'merchantId is required' });
    }

    const packageData = await Package.findOne({
      where: { 
        id,
        merchantId 
      }
    });

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    await packageData.update({
      name: name || packageData.name,
      type: type || packageData.type,
      amount: amount ? parseFloat(amount) : packageData.amount,
      seedAmount: seedAmount ? parseFloat(seedAmount) : packageData.seedAmount,
      seedType: seedType || packageData.seedType,
      period: period ? parseInt(period) : packageData.period,
      collectionDays: collectionDays || packageData.collectionDays,
      duration: duration ? parseInt(duration) : packageData.duration,
      benefits: benefits ? (Array.isArray(benefits) ? benefits : [benefits]) : packageData.benefits,
      description: description !== undefined ? description : packageData.description,
      status: status || packageData.status,
      interestRate: interestRate ? parseFloat(interestRate) : packageData.interestRate,
      extraCharges: extraCharges ? parseFloat(extraCharges) : packageData.extraCharges,
      defaultPenalty: defaultPenalty ? parseFloat(defaultPenalty) : packageData.defaultPenalty,
      defaultDays: defaultDays ? parseInt(defaultDays) : packageData.defaultDays,
      // Loan-specific fields
      loanAmount: loanAmount ? parseFloat(loanAmount) : packageData.loanAmount,
      loanInterestRate: loanInterestRate ? parseFloat(loanInterestRate) : packageData.loanInterestRate,
      loanPeriod: loanPeriod ? parseInt(loanPeriod) : packageData.loanPeriod,
      defaultAmount: defaultAmount ? parseFloat(defaultAmount) : packageData.defaultAmount,
      gracePeriod: gracePeriod ? parseInt(gracePeriod) : packageData.gracePeriod,
      loanCharges: loanCharges ? parseFloat(loanCharges) : packageData.loanCharges,
      packageCategory: packageCategory || packageData.packageCategory
    });

    res.json({
      success: true,
      message: 'Package updated successfully',
      package: packageData
    });
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update package',
      error: error.message
    });
  }
};

// Delete package (soft delete)
const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const packageData = await Package.findOne({
      where: { 
        id,
        merchantId 
      }
    });

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    await packageData.update({ status: 'Deleted' });

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete package',
      error: error.message
    });
  }
};

// Get active packages (for customer selection)
const getActivePackages = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { category } = req.query;

    let whereClause = { 
      merchantId,
      status: 'Active'
    };

    // Add category filter if provided
    if (category) {
      whereClause.packageCategory = category;
    }

    const packages = await Package.findAll({
      where: whereClause,
      order: [['amount', 'ASC']]
    });

    res.json({
      success: true,
      packages
    });
  } catch (error) {
    console.error('Error fetching active packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active packages',
      error: error.message
    });
  }
};

module.exports = {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  getActivePackages
};
