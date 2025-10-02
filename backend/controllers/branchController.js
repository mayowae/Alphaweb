const { Branch, Merchant } = require('../models');

// Create branch
const createBranch = async (req, res) => {
  try {
    const { name, state, location, merchantId } = req.body;

    // Check if branch already exists
    const existingBranch = await Branch.findOne({ where: { name } });
    if (existingBranch) {
      return res.status(400).json({ message: 'Branch name already exists' });
    }

    // Verify merchant exists
    const merchant = await Merchant.findByPk(merchantId);
    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    // Create branch
    const branch = await Branch.create({
      name,
      state,
      location,
      merchantId,
    });

    res.status(201).json({
      message: 'Branch created successfully',
      branch: {
        id: branch.id,
        name: branch.name,
        state: branch.state,
        location: branch.location,
      },
    });
  } catch (error) {
    console.error('Branch creation error:', error);
    res.status(500).json({ message: 'Branch creation failed', error: error.message });
  }
};

// Update branch
const updateBranch = async (req, res) => {
  try {
    const { id, name, state, location } = req.body;

    const branch = await Branch.findByPk(id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Check if name is being changed and if it's already taken
    if (name !== branch.name) {
      const existingBranch = await Branch.findOne({ where: { name } });
      if (existingBranch) {
        return res.status(400).json({ message: 'Branch name already taken' });
      }
    }

    // Update branch
    await branch.update({
      name,
      state,
      location,
    });

    res.json({
      message: 'Branch updated successfully',
      branch: {
        id: branch.id,
        name: branch.name,
        state: branch.state,
        location: branch.location,
      },
    });
  } catch (error) {
    console.error('Branch update error:', error);
    res.status(500).json({ message: 'Branch update failed', error: error.message });
  }
};

// List all branches
const listBranches = async (req, res) => {
  try {
    const branches = await Branch.findAll({
      attributes: ['id', 'name', 'state', 'location', 'createdAt'],
      include: [
        {
          model: Merchant,
          as: 'Merchant',
          attributes: ['id', 'businessName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      message: 'Branches retrieved successfully',
      branches,
    });
  } catch (error) {
    console.error('List branches error:', error);
    res.status(500).json({ message: 'Failed to retrieve branches', error: error.message });
  }
};

// Get branch by ID
const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findByPk(id, {
      include: [
        {
          model: Merchant,
          as: 'Merchant',
          attributes: ['id', 'businessName'],
        },
      ],
    });

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.json({
      message: 'Branch retrieved successfully',
      branch,
    });
  } catch (error) {
    console.error('Get branch error:', error);
    res.status(500).json({ message: 'Failed to retrieve branch', error: error.message });
  }
};

// Delete branch
const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    const branch = await Branch.findByPk(id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    await branch.destroy();

    res.json({
      message: 'Branch deleted successfully',
    });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({ message: 'Failed to delete branch', error: error.message });
  }
};

module.exports = {
  createBranch,
  updateBranch,
  listBranches,
  getBranchById,
  deleteBranch,
};
