const db = require('../models');
const { Charge, ChargeAssignment, Customer, Merchant } = db;

// Create a new charge
exports.createCharge = async (req, res) => {
  try {
    const { chargeName, type, amount } = req.body;
    const merchantId = req.user.id;

    // Validate required fields
    if (!chargeName || !type || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Charge name, type, and amount are required'
      });
    }

    // Validate type
    const validTypes = ['Loan', 'Penalty', 'Service'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid charge type. Must be one of: Loan, Penalty, Service'
      });
    }

    // Normalize amount (supports raw number or currency-formatted string)
    const normalizedAmount = typeof amount === 'string'
      ? parseFloat(amount.replace(/[^\d.-]/g, ''))
      : Number(amount);
    if (Number.isNaN(normalizedAmount)) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // Create the charge
    const charge = await Charge.create({
      chargeName,
      type,
      amount: normalizedAmount,
      merchantId
    });

    res.status(201).json({
      success: true,
      message: 'Charge created successfully',
      charge: {
        id: charge.id,
        chargeName: charge.chargeName,
        type: charge.type,
        amount: `N${Number(charge.amount || 0).toLocaleString()}`,
        activeCustomers: 0,
        lastUpdated: (charge.updatedAt ? charge.updatedAt : new Date()).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      }
    });
  } catch (error) {
    console.error('Create charge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all charges for a merchant
exports.getCharges = async (req, res) => {
  try {
    const merchantId = req.user.id;

    const charges = await Charge.findAll({
      where: {
        merchantId,
        isActive: true
      },
      include: [
        {
          model: ChargeAssignment,
          attributes: ['id'],
          required: false
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    const formattedCharges = charges.map(charge => ({
      id: charge.id,
      chargeName: charge.chargeName,
      type: charge.type,
      amount: `N${Number(charge.amount || 0).toLocaleString()}`,
      activeCustomers: charge.ChargeAssignments ? charge.ChargeAssignments.length : 0,
      lastUpdated: (charge.updatedAt ? charge.updatedAt : new Date()).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }));

    res.json({
      success: true,
      charges: formattedCharges
    });
  } catch (error) {
    console.error('Get charges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Assign charge to customer
exports.assignCharge = async (req, res) => {
  try {
    const { chargeName, amount, dueDate, customer } = req.body;
    const merchantId = req.user.id;

    // Validate required fields
    if (!chargeName || !amount || !dueDate || !customer) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Find the charge by name
    const charge = await Charge.findOne({
      where: {
        chargeName,
        merchantId,
        isActive: true
      }
    });

    if (!charge) {
      return res.status(404).json({
        success: false,
        message: 'Charge not found'
      });
    }

    // Find the customer by name
    const customerRecord = await Customer.findOne({
      where: {
        fullName: customer,
        merchantId
      }
    });

    if (!customerRecord) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Normalize assignment amount
    const normalizedAssignmentAmount = typeof amount === 'string'
      ? parseFloat(amount.replace(/[^\d.-]/g, ''))
      : Number(amount);
    if (Number.isNaN(normalizedAssignmentAmount)) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // Create charge assignment
    const assignment = await ChargeAssignment.create({
      chargeId: charge.id,
      customerId: customerRecord.id,
      amount: normalizedAssignmentAmount,
      dueDate: new Date(dueDate),
      merchantId,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Charge assigned successfully',
      assignment: {
        id: assignment.id,
        chargeName: charge.chargeName,
        customerName: customer,
        amount: `N${Number(assignment.amount || 0).toLocaleString()}`,
        dueDate: (assignment.dueDate ? assignment.dueDate : new Date()).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        dateApplied: (assignment.dateApplied ? assignment.dateApplied : new Date()).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        status: assignment.status
      }
    });
  } catch (error) {
    console.error('Assign charge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get charge history (assignments)
exports.getChargeHistory = async (req, res) => {
  try {
    const merchantId = req.user.id;

    const assignments = await ChargeAssignment.findAll({
      where: { merchantId },
      include: [
        {
          model: Charge,
          attributes: ['chargeName'],
          required: false
        },
        {
          model: Customer,
          attributes: ['fullName', 'accountNumber'],
          required: false
        }
      ],
      order: [['dateApplied', 'DESC']]
    });

    const formattedHistory = assignments.map(assignment => ({
      id: assignment.id,
      customerName: assignment.Customer?.fullName || 'N/A',
      accountNumber: assignment.Customer?.accountNumber || 'N/A',
      chargeName: assignment.Charge?.chargeName || '—',
      amount: `N${Number(assignment.amount || 0).toLocaleString()}`,
      dueDate: (assignment.dueDate ? assignment.dueDate : new Date()).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      dateApplied: (assignment.dateApplied ? assignment.dateApplied : new Date()).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      status: assignment.status
    }));

    res.json({
      success: true,
      history: formattedHistory
    });
  } catch (error) {
    console.error('Get charge history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update charge
exports.updateCharge = async (req, res) => {
  try {
    const { id, chargeName, type, amount } = req.body;
    const merchantId = req.user.id;

    const charge = await Charge.findOne({
      where: {
        id,
        merchantId
      }
    });

    if (!charge) {
      return res.status(404).json({
        success: false,
        message: 'Charge not found'
      });
    }

    // Update charge
    const normalizedUpdateAmount = amount === undefined || amount === null ? undefined : (
      typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : Number(amount)
    );
    if (normalizedUpdateAmount !== undefined && Number.isNaN(normalizedUpdateAmount)) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    await charge.update({
      chargeName: chargeName || charge.chargeName,
      type: type || charge.type,
      amount: normalizedUpdateAmount !== undefined ? normalizedUpdateAmount : charge.amount
    });

    res.json({
      success: true,
      message: 'Charge updated successfully',
      charge: {
        id: charge.id,
        chargeName: charge.chargeName,
        type: charge.type,
        amount: `N${Number(charge.amount || 0).toLocaleString()}`,
        lastUpdated: charge.updatedAt.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })
      }
    });
  } catch (error) {
    console.error('Update charge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete charge
exports.deleteCharge = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const charge = await Charge.findOne({
      where: {
        id,
        merchantId
      }
    });

    if (!charge) {
      return res.status(404).json({
        success: false,
        message: 'Charge not found'
      });
    }

    // Soft delete by setting isActive to false
    await charge.update({ isActive: false });

    res.json({
      success: true,
      message: 'Charge deleted successfully'
    });
  } catch (error) {
    console.error('Delete charge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update charge assignment status (mark as paid)
exports.updateChargeAssignmentStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const merchantId = req.user.id;

    const assignment = await ChargeAssignment.findOne({
      where: {
        id,
        merchantId
      }
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Charge assignment not found'
      });
    }

    const updateData = { status };
    if (status === 'Paid') {
      updateData.datePaid = new Date();
    }

    await assignment.update(updateData);

    res.json({
      success: true,
      message: 'Charge assignment status updated successfully'
    });
  } catch (error) {
    console.error('Update charge assignment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
