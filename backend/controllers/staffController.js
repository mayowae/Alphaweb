const { Staff, Role, Branch, Merchant } = require('../models');

// Create staff
const createStaff = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, branch, role, merchantId, roleId } = req.body;

    // Check if staff already exists
    const existingStaff = await Staff.findOne({ where: { email } });
    if (existingStaff) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Verify merchant exists
    const merchant = await Merchant.findByPk(merchantId);
    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    // Verify role exists
    const staffRole = await Role.findByPk(roleId);
    if (!staffRole) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Create staff
    const staff = await Staff.create({
      fullName,
      email,
      phoneNumber,
      branch,
      role,
      merchantId,
      roleId,
    });

    res.status(201).json({
      message: 'Staff created successfully',
      staff: {
        id: staff.id,
        fullName: staff.fullName,
        email: staff.email,
        phoneNumber: staff.phoneNumber,
        branch: staff.branch,
        role: staff.role,
      },
    });
  } catch (error) {
    console.error('Staff creation error:', error);
    res.status(500).json({ message: 'Staff creation failed', error: error.message });
  }
};

// Update staff
const updateStaff = async (req, res) => {
  try {
    const { id, fullName, email, phoneNumber, branch, role, roleId } = req.body;

    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email !== staff.email) {
      const existingStaff = await Staff.findOne({ where: { email } });
      if (existingStaff) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    // Verify role exists if provided
    if (roleId) {
      const staffRole = await Role.findByPk(roleId);
      if (!staffRole) {
        return res.status(404).json({ message: 'Role not found' });
      }
    }

    // Update staff
    await staff.update({
      fullName,
      email,
      phoneNumber,
      branch,
      role,
      roleId,
    });

    res.json({
      message: 'Staff updated successfully',
      staff: {
        id: staff.id,
        fullName: staff.fullName,
        email: staff.email,
        phoneNumber: staff.phoneNumber,
        branch: staff.branch,
        role: staff.role,
      },
    });
  } catch (error) {
    console.error('Staff update error:', error);
    res.status(500).json({ message: 'Staff update failed', error: error.message });
  }
};

// List all staff
const listStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll({
      attributes: ['id', 'fullName', 'email', 'phoneNumber', 'branch', 'role', 'status', 'createdAt'],
      include: [
        {
          model: Role,
          as: 'Role',
          attributes: ['id', 'roleName'],
        },
        {
          model: Merchant,
          as: 'Merchant',
          attributes: ['id', 'businessName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      message: 'Staff retrieved successfully',
      staff,
    });
  } catch (error) {
    console.error('List staff error:', error);
    res.status(500).json({ message: 'Failed to retrieve staff', error: error.message });
  }
};

// Get staff by ID
const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findByPk(id, {
      include: [
        {
          model: Role,
          as: 'Role',
          attributes: ['id', 'roleName'],
        },
        {
          model: Merchant,
          as: 'Merchant',
          attributes: ['id', 'businessName'],
        },
      ],
    });

    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }

    res.json({
      message: 'Staff retrieved successfully',
      staff,
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ message: 'Failed to retrieve staff', error: error.message });
  }
};

module.exports = {
  createStaff,
  updateStaff,
  listStaff,
  getStaffById,
};
