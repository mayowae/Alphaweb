const { Repayment, Loan, Customer, Agent } = require('../models');
const { Op } = require('sequelize');

// Create a new repayment
const createRepayment = async (req, res) => {
  try {
    const { 
      loanId, 
      customerName, 
      accountNumber, 
      package, 
      amount, 
      branch, 
      agentId, 
      paymentMethod, 
      reference, 
      notes 
    } = req.body;
    // Resolve merchantId based on auth context (merchant vs collaborator)
    let merchantId = req.user.id;
    if (req.user && req.user.type === 'collaborator') {
      if (req.user.merchantId) {
        merchantId = req.user.merchantId;
      } else if (req.headers && req.headers['x-merchant-id']) {
        const hdr = Number(req.headers['x-merchant-id']);
        if (Number.isFinite(hdr)) merchantId = hdr;
      }
    }

    // Normalize loanId
    const normalizedLoanId = Number.isFinite(Number(loanId)) ? Number(loanId) : undefined;

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Loan not found'
      });
    }

    // Find customer first
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

    // Resolve Loan after customer is known using a single OR-based query
    const whereOr = [];
    if (normalizedLoanId) {
      whereOr.push({ id: normalizedLoanId });
    }
    if (accountNumber) {
      whereOr.push({ accountNumber });
    }
    if (customer && customer.id) {
      whereOr.push({ customerId: customer.id });
    }
    if (customerName) {
      const trimmed = String(customerName || '').trim();
      whereOr.push({ customerName: { [Op.iLike]: trimmed } });
    }

    let loan = null;
    if (whereOr.length > 0) {
      loan = await Loan.findOne({
        where: { merchantId, [Op.or]: whereOr },
        order: [['dateIssued', 'DESC']]
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

    // Generate transaction ID
    const transactionId = `REP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const repayment = await Repayment.create({
      transactionId,
      loanId,
      customerId: customer.id,
      customerName,
      accountNumber: accountNumber || customer.accountNumber || (loan ? loan.accountNumber : null),
      package,
      amount: parseFloat(amount),
      branch,
      agentId: agent ? agent.id : null,
      agentName: agent ? agent.fullName : null,
      merchantId,
      paymentMethod,
      reference,
      notes
    });

    // Update loan amount paid and remaining amount
    const currentPaid = parseFloat(loan.amountPaid || 0);
    const payDelta = parseFloat(amount || 0);
    const totalAmt = parseFloat(loan.totalAmount || 0);
    const newAmountPaid = currentPaid + payDelta;
    const newRemainingAmount = Math.max(totalAmt - newAmountPaid, 0);
    
    await loan.update({
      amountPaid: newAmountPaid,
      remainingAmount: newRemainingAmount,
      status: newRemainingAmount <= 0 ? 'Completed' : 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Repayment created successfully',
      data: repayment
    });
  } catch (error) {
    console.error('Error creating repayment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create repayment',
      error: error.message
    });
  }
};

// Get all repayments with filtering, search, and pagination
const getRepayments = async (req, res) => {
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
      whereClause.date = {
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
        { transactionId: { [Op.iLike]: `%${search}%` } },
        { agentName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    
    const { count, rows: repayments } = await Repayment.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[req.query.sortBy || 'date', req.query.sortOrder === 'ASC' ? 'ASC' : 'DESC']],
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'fullName', 'phoneNumber', 'accountNumber'] },
        { model: Agent, as: 'agent', attributes: ['id', 'fullName'] },
        { model: Loan, as: 'loan', attributes: ['id', 'loanAmount', 'totalAmount', 'accountNumber'] }
      ]
    });

    const totalPages = Math.ceil(count / limit);

    // Ensure accountNumber is populated from repayment or fallbacks
    const serialized = repayments.map((r) => {
      const json = r.toJSON();
      const acc = json.accountNumber || json.customer?.accountNumber || json.loan?.accountNumber || null;
      return { ...json, accountNumber: acc };
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
    console.error('Error fetching repayments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repayments',
      error: error.message
    });
  }
};

// Get repayment by ID
const getRepaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const repayment = await Repayment.findOne({
      where: { id, merchantId },
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'fullName', 'phoneNumber', 'email'] },
        { model: Agent, as: 'agent', attributes: ['id', 'fullName', 'phoneNumber'] },
        { model: Loan, as: 'loan', attributes: ['id', 'loanAmount', 'totalAmount', 'amountPaid', 'remainingAmount'] }
      ]
    });

    if (!repayment) {
      return res.status(404).json({
        success: false,
        message: 'Repayment not found'
      });
    }

    res.json({
      success: true,
      data: repayment
    });
  } catch (error) {
    console.error('Error fetching repayment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repayment',
      error: error.message
    });
  }
};

// Update repayment status
const updateRepaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const merchantId = req.user.id;

    const repayment = await Repayment.findOne({
      where: { id, merchantId }
    });

    if (!repayment) {
      return res.status(404).json({
        success: false,
        message: 'Repayment not found'
      });
    }

    const updateData = { status };
    if (notes) updateData.notes = notes;

    await repayment.update(updateData);

    res.json({
      success: true,
      message: 'Repayment status updated successfully',
      data: repayment
    });
  } catch (error) {
    console.error('Error updating repayment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update repayment status',
      error: error.message
    });
  }
};

// Delete repayment
const deleteRepayment = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const repayment = await Repayment.findOne({
      where: { id, merchantId }
    });

    if (!repayment) {
      return res.status(404).json({
        success: false,
        message: 'Repayment not found'
      });
    }

    // Update loan amounts before deleting repayment
    const loan = await Loan.findByPk(repayment.loanId);
    if (loan) {
      const newAmountPaid = parseFloat(loan.amountPaid) - parseFloat(repayment.amount);
      const newRemainingAmount = parseFloat(loan.totalAmount) - newAmountPaid;
      
      await loan.update({
        amountPaid: newAmountPaid,
        remainingAmount: newRemainingAmount,
        status: newRemainingAmount > 0 ? 'Active' : 'Completed'
      });
    }

    await repayment.destroy();

    res.json({
      success: true,
      message: 'Repayment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting repayment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete repayment',
      error: error.message
    });
  }
};

// Get repayment statistics
const getRepaymentStats = async (req, res) => {
  try {
    const merchantId = req.user.id;

    const totalRepayments = await Repayment.count({ where: { merchantId } });
    const completedRepayments = await Repayment.count({ where: { merchantId, status: 'Completed' } });
    const pendingRepayments = await Repayment.count({ where: { merchantId, status: 'Pending' } });

    const totalAmount = await Repayment.sum('amount', { where: { merchantId } });
    const totalCollection = await Repayment.sum('amount', { where: { merchantId, status: 'Completed' } });

    res.json({
      success: true,
      data: {
        totalRepayments,
        completedRepayments,
        pendingRepayments,
        totalAmount: totalAmount || 0,
        totalCollection: totalCollection || 0
      }
    });
  } catch (error) {
    console.error('Error fetching repayment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch repayment statistics',
      error: error.message
    });
  }
};

module.exports = {
  createRepayment,
  getRepayments,
  getRepaymentById,
  updateRepaymentStatus,
  deleteRepayment,
  getRepaymentStats
};



