const { LoanApplication, Customer, Agent, Staff } = require('../models');
const { Op } = require('sequelize');

// Create a new loan application
const createLoanApplication = async (req, res) => {
  try {
    const { 
      customerName, 
      accountNumber, 
      requestedAmount, 
      interestRate, 
      duration, 
      agentId, 
      branch, 
      notes,
      purpose,
      collateral
    } = req.body;
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

    // Get agent details if provided
    let agentName = null;
    if (agentId) {
      const agent = await Agent.findByPk(agentId);
      agentName = agent ? agent.fullName : null;
    }

    const application = await LoanApplication.create({
      customerId: customer.id,
      customerName,
      accountNumber: accountNumber || customer.accountNumber,
      requestedAmount: parseFloat(requestedAmount),
      interestRate: parseFloat(interestRate),
      duration: parseInt(duration),
      agentId,
      agentName,
      branch,
      notes,
      purpose,
      collateral,
      merchantId,
      dateApplied: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Loan application created successfully',
      application
    });
  } catch (error) {
    console.error('Error creating loan application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create loan application',
      error: error.message
    });
  }
};

// Get all loan applications for a merchant
const getLoanApplications = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { 
      status, 
      search, 
      fromDate, 
      toDate, 
      page = 1, 
      limit = 10 
    } = req.query;

    const whereClause = { merchantId };
    
    // Add status filter
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Add date range filter
    if (fromDate || toDate) {
      whereClause.dateApplied = {};
      if (fromDate) {
        whereClause.dateApplied[Op.gte] = new Date(fromDate);
      }
      if (toDate) {
        whereClause.dateApplied[Op.lte] = new Date(toDate);
      }
    }

    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { customerName: { [Op.iLike]: `%${search}%` } },
        { accountNumber: { [Op.iLike]: `%${search}%` } },
        { agentName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    
    const { count, rows: applications } = await LoanApplication.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'email', 'phoneNumber']
        },
        {
          model: Agent,
          as: 'agent',
          attributes: ['id', 'fullName', 'phoneNumber']
        }
      ],
      order: [['dateApplied', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching loan applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loan applications',
      error: error.message
    });
  }
};

// Get loan application by ID
const getLoanApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const application = await LoanApplication.findOne({
      where: { 
        id,
        merchantId 
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'email', 'phoneNumber']
        },
        {
          model: Agent,
          as: 'agent',
          attributes: ['id', 'fullName', 'phoneNumber']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Loan application not found'
      });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    console.error('Error fetching loan application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loan application',
      error: error.message
    });
  }
};

// Update loan application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, rejectionReason } = req.body;
    const merchantId = req.user.id;
    const staffId = req.user.id; // Assuming staff ID is available

    const application = await LoanApplication.findOne({
      where: { 
        id,
        merchantId 
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Loan application not found'
      });
    }

    const updateData = { status };
    
    if (status === 'Approved') {
      updateData.approvedBy = staffId;
      updateData.approvedAt = new Date();
    } else if (status === 'Rejected') {
      updateData.rejectionReason = rejectionReason;
    }

    if (notes) {
      updateData.notes = notes;
    }

    await application.update(updateData);

    res.json({
      success: true,
      message: `Application ${status.toLowerCase()} successfully`,
      application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
};

// Delete loan application
const deleteLoanApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const application = await LoanApplication.findOne({
      where: { 
        id,
        merchantId 
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Loan application not found'
      });
    }

    await application.destroy();

    res.json({
      success: true,
      message: 'Loan application deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting loan application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete loan application',
      error: error.message
    });
  }
};

module.exports = {
  createLoanApplication,
  getLoanApplications,
  getLoanApplicationById,
  updateApplicationStatus,
  deleteLoanApplication
};
