const { InvestmentApplication, Customer, Agent, Staff } = require('../models');
const { Op } = require('sequelize');

// Update investment application (basic fields)
const updateInvestmentApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetAmount, duration, agentId, branch, notes, status } = req.body;
    const merchantId = req.user?.id || req.body.merchantId || 1;

    const application = await InvestmentApplication.findOne({ where: { id, merchantId } });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Investment application not found' });
    }

    const updateData = {};
    if (targetAmount !== undefined) updateData.targetAmount = parseFloat(targetAmount);
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (agentId !== undefined) updateData.agentId = agentId;
    if (branch !== undefined) updateData.branch = branch;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;

    await application.update(updateData);

    return res.json({ success: true, message: 'Investment application updated', application });
  } catch (error) {
    console.error('Error updating investment application:', error);
    res.status(500).json({ success: false, message: 'Failed to update investment application', error: error.message });
  }
};

// Create a new investment application
const createInvestmentApplication = async (req, res) => {
  try {
    const { 
      customerName, 
      accountNumber, 
      targetAmount, 
      duration, 
      agentId, 
      branch, 
      notes 
    } = req.body;
    // Use merchantId from request body or default to 1 for testing
    const merchantId = req.body.merchantId || req.user?.id || 1;

    // Find customer by name (without merchantId filter for testing)
    const customer = await Customer.findOne({
      where: {
        fullName: customerName
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

    const application = await InvestmentApplication.create({
      customerId: customer.id,
      customerName,
      accountNumber: accountNumber || customer.accountNumber,
      targetAmount: parseFloat(targetAmount),
      duration: parseInt(duration),
      agentId,
      agentName,
      branch,
      notes,
      merchantId,
      dateApplied: new Date()
    });

    // Fetch the created application with joined data
    const applicationWithJoins = await InvestmentApplication.findByPk(application.id, {
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

    // Transform the data to prioritize joined customer data
    const appData = applicationWithJoins.toJSON();
    // If we have joined customer data, use it instead of stored customerName
    if (appData.customer && appData.customer.fullName) {
      appData.customerName = appData.customer.fullName;
    }
    // If we have joined agent data, use it instead of stored agentName
    if (appData.agent && appData.agent.fullName) {
      appData.agentName = appData.agent.fullName;
    }

    res.status(201).json({
      success: true,
      message: 'Investment application created successfully',
      application: appData
    });
  } catch (error) {
    console.error('Error creating investment application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create investment application',
      error: error.message
    });
  }
};

// Get all investment applications for a merchant
const getInvestmentApplications = async (req, res) => {
  try {
    // Use merchantId from query or default to 1 for testing
    const merchantId = req.query.merchantId || req.user?.id || 1;
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
    
    const { count, rows: applications } = await InvestmentApplication.findAndCountAll({
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

    // Transform the data to prioritize joined customer data
    const transformedApplications = applications.map(app => {
      const appData = app.toJSON();
      // If we have joined customer data, use it instead of stored customerName
      if (appData.customer && appData.customer.fullName) {
        appData.customerName = appData.customer.fullName;
      }
      // If we have joined agent data, use it instead of stored agentName
      if (appData.agent && appData.agent.fullName) {
        appData.agentName = appData.agent.fullName;
      }
      return appData;
    });

    res.json({
      success: true,
      applications: transformedApplications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching investment applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investment applications',
      error: error.message
    });
  }
};

// Get investment application by ID
const getInvestmentApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const application = await InvestmentApplication.findOne({
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
        message: 'Investment application not found'
      });
    }

    // Transform the data to prioritize joined customer data
    const appData = application.toJSON();
    // If we have joined customer data, use it instead of stored customerName
    if (appData.customer && appData.customer.fullName) {
      appData.customerName = appData.customer.fullName;
    }
    // If we have joined agent data, use it instead of stored agentName
    if (appData.agent && appData.agent.fullName) {
      appData.agentName = appData.agent.fullName;
    }

    res.json({
      success: true,
      application: appData
    });
  } catch (error) {
    console.error('Error fetching investment application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investment application',
      error: error.message
    });
  }
};

// Update investment application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, rejectionReason } = req.body;
    const merchantId = req.user?.id || req.body.merchantId || 1;
    const staffId = req.user?.id || 1;

    const application = await InvestmentApplication.findOne({
      where: { 
        id,
        merchantId 
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Investment application not found'
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

// Delete investment application
const deleteInvestmentApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const application = await InvestmentApplication.findOne({
      where: { 
        id,
        merchantId 
      }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Investment application not found'
      });
    }

    await application.destroy();

    res.json({
      success: true,
      message: 'Investment application deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting investment application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete investment application',
      error: error.message
    });
  }
};

module.exports = {
  createInvestmentApplication,
  getInvestmentApplications,
  getInvestmentApplicationById,
  updateApplicationStatus,
  deleteInvestmentApplication,
  updateInvestmentApplication
};
