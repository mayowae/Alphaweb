const { Investment, Customer } = require('../models');
const { Op } = require('sequelize');

// Create a new investment
const createInvestment = async (req, res) => {
  try {
    const { customerName, amount, plan, duration } = req.body;
    const merchantId = req.user.id;

    // Find customer by name
    const customer = await Customer.findOne({
      where: {
        fullName: customerName,
        merchantId: merchantId
      }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const investment = await Investment.create({
      customerId: customer.id,
      customerName,
      amount: parseFloat(amount),
      plan,
      duration: parseInt(duration),
      status: 'Active',
      merchantId,
      dateCreated: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Investment created successfully',
      investment
    });
  } catch (error) {
    console.error('Error creating investment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create investment',
      error: error.message
    });
  }
};

// Get all investments for a merchant
const getInvestments = async (req, res) => {
  try {
    const merchantId = req.user.id;

    const investments = await Investment.findAll({
      where: { merchantId },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'email', 'phoneNumber']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      investments
    });
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investments',
      error: error.message
    });
  }
};

// Get investment by ID
const getInvestmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const investment = await Investment.findOne({
      where: { 
        id,
        merchantId 
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'email', 'phoneNumber']
        }
      ]
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    res.json({
      success: true,
      investment
    });
  } catch (error) {
    console.error('Error fetching investment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investment',
      error: error.message
    });
  }
};

// Update investment
const updateInvestment = async (req, res) => {
  try {
    const { id, customerName, amount, plan, duration, status } = req.body;
    const merchantId = req.user.id;

    const investment = await Investment.findOne({
      where: { 
        id,
        merchantId 
      }
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    await investment.update({
      customerName: customerName || investment.customerName,
      amount: amount ? parseFloat(amount) : investment.amount,
      plan: plan || investment.plan,
      duration: duration ? parseInt(duration) : investment.duration,
      status: status || investment.status
    });

    res.json({
      success: true,
      message: 'Investment updated successfully',
      investment
    });
  } catch (error) {
    console.error('Error updating investment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update investment',
      error: error.message
    });
  }
};

// Delete investment (soft delete)
const deleteInvestment = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const investment = await Investment.findOne({
      where: { 
        id,
        merchantId 
      }
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    await investment.update({ status: 'Deleted' });

    res.json({
      success: true,
      message: 'Investment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting investment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete investment',
      error: error.message
    });
  }
};

module.exports = {
  createInvestment,
  getInvestments,
  getInvestmentById,
  updateInvestment,
  deleteInvestment
};
