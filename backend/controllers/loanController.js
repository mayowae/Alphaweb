const { Loan, Customer, Agent, Staff } = require('../models');
const { Op } = require('sequelize');

// Create a new loan
const createLoan = async (req, res) => {
  try {
    const { 
      customerName, 
      accountNumber, 
      loanAmount, 
      interestRate, 
      duration, 
      agentId, 
      branch, 
      notes,
      dueDate
    } = req.body;
    const merchantId = req.user.id;

    // Handle uploaded file
    let formUrl = null;
    if (req.file) {
      // Expose via static uploads route
      formUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

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

    // Find agent if provided
    let agent = null;
    if (agentId) {
      agent = await Agent.findOne({
        where: {
          id: agentId,
          merchantId: merchantId
        }
      });
    }

    // Calculate total amount and remaining amount
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 100;
    const durationInMonths = parseInt(duration) / 30; // Convert days to months
    const interest = principal * rate * durationInMonths;
    const totalAmount = principal + interest;

    const enrichedNotes = formUrl ? JSON.stringify({ formUrl, notes: notes || null }) : notes;

    const loan = await Loan.create({
      customerId: customer.id,
      customerName,
      accountNumber,
      loanAmount: principal,
      interestRate,
      duration,
      agentId: agent ? agent.id : null,
      agentName: agent ? agent.fullName : null,
      branch,
      merchantId,
      dueDate: new Date(dueDate),
      notes: enrichedNotes,
      totalAmount,
      remainingAmount: totalAmount,
      amountPaid: 0,
      // formUrl not stored as a separate column; embedded in notes JSON
    });

    res.status(201).json({
      success: true,
      message: 'Loan created successfully',
      data: {
        ...loan.toJSON(),
        formUrl: formUrl || (typeof loan.notes === 'string' && loan.notes.startsWith('{') ? (JSON.parse(loan.notes).formUrl || null) : null)
      }
    });
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create loan',
      error: error.message
    });
  }
};

// Get all loans with filtering, search, and pagination
const getLoans = async (req, res) => {
  try {
    const { 
      status, 
      search, 
      fromDate, 
      toDate, 
      page = 1, 
      limit = 10,
      agentId 
    } = req.query;
    const merchantId = req.user.id;

    const whereClause = { merchantId };

    // Status filter
    if (status && status !== 'All') {
      whereClause.status = status;
    }

    // Date range filter
    if (fromDate && toDate) {
      whereClause.dateIssued = {
        [Op.between]: [new Date(fromDate), new Date(toDate)]
      };
    }

    // Agent filter
    if (agentId && agentId !== 'All') {
      whereClause.agentId = agentId;
    }

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { customerName: { [Op.iLike]: `%${search}%` } },
        { accountNumber: { [Op.iLike]: `%${search}%` } },
        { agentName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    
    const { count, rows: loans } = await Loan.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date_issued', 'DESC']],
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'fullName', 'phoneNumber'] },
        { model: Agent, as: 'agent', attributes: ['id', 'fullName'] }
      ]
    });

    const totalPages = Math.ceil(count / limit);

    const serialized = loans.map(l => {
      const json = l.toJSON();
      let parsedFormUrl = null;
      if (typeof json.notes === 'string' && json.notes.startsWith('{')) {
        try { parsedFormUrl = JSON.parse(json.notes).formUrl || null; } catch {}
      }
      return { ...json, formUrl: parsedFormUrl };
    });

    res.json({
      success: true,
      data: serialized,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loans',
      error: error.message
    });
  }
};

// Get loan by ID
const getLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const loan = await Loan.findOne({
      where: { id, merchantId },
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'fullName', 'phoneNumber', 'email'] },
        { model: Agent, as: 'agent', attributes: ['id', 'fullName', 'phoneNumber'] }
      ]
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    const json = loan.toJSON();
    const outstanding = parseFloat(json.totalAmount) - parseFloat(json.amountPaid || 0);
    res.json({
      success: true,
      data: { ...json, outstandingAmount: outstanding }
    });
  } catch (error) {
    console.error('Error fetching loan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loan',
      error: error.message
    });
  }
};

// Update loan status
const updateLoanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const merchantId = req.user.id;

    const loan = await Loan.findOne({
      where: { id, merchantId }
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    const updateData = { status };
    if (notes) updateData.notes = notes;
    if (status === 'Active') {
      let approverId = null;
      // Prefer explicit staffId on token if present
      if (req.user && req.user.staffId) {
        approverId = req.user.staffId;
      } else if (req.user && req.user.type === 'staff') {
        // Fallback: if token represents staff, ensure it exists in Staff table
        const staff = await Staff.findByPk(req.user.id);
        if (staff) {
          approverId = staff.id;
        }
      }

      if (approverId) {
        updateData.approvedBy = approverId;
        updateData.approvedAt = new Date();
      }
    }

    await loan.update(updateData);

    res.json({
      success: true,
      message: 'Loan status updated successfully',
      data: loan
    });
  } catch (error) {
    console.error('Error updating loan status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update loan status',
      error: error.message
    });
  }
};

// Delete loan
const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const loan = await Loan.findOne({
      where: { id, merchantId }
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    await loan.destroy();

    res.json({
      success: true,
      message: 'Loan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting loan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete loan',
      error: error.message
    });
  }
};

// Get loan statistics
const getLoanStats = async (req, res) => {
  try {
    const merchantId = req.user.id;

    const totalLoans = await Loan.count({ where: { merchantId } });
    const activeLoans = await Loan.count({ where: { merchantId, status: 'Active' } });
    const completedLoans = await Loan.count({ where: { merchantId, status: 'Completed' } });
    const defaultedLoans = await Loan.count({ where: { merchantId, status: 'Defaulted' } });

    const totalAmount = await Loan.sum('loanAmount', { where: { merchantId } });
    const totalCollection = await Loan.sum('amountPaid', { where: { merchantId } });

    res.json({
      success: true,
      data: {
        totalLoans,
        activeLoans,
        completedLoans,
        defaultedLoans,
        totalAmount: totalAmount || 0,
        totalCollection: totalCollection || 0
      }
    });
  } catch (error) {
    console.error('Error fetching loan stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch loan statistics',
      error: error.message
    });
  }
};

module.exports = {
  createLoan,
  getLoans,
  getLoanById,
  updateLoanStatus,
  deleteLoan,
  getLoanStats
};
