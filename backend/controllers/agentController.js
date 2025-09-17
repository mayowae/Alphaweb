const bcrypt = require('bcryptjs');
const { Agent, Branch, Merchant, Customer } = require('../models');

// Register agent
const registerAgent = async (req, res) => {
  try {
    const { fullName, phoneNumber, email, password, branch, merchantId } = req.body;

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ where: { email } });
    if (existingAgent) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Verify merchant exists
    const merchant = await Merchant.findByPk(merchantId);
    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create agent
    const agent = await Agent.create({
      fullName,
      phoneNumber,
      email,
      password: hashedPassword,
      branch,
      merchantId,
    });

    res.status(201).json({
      success: true,
      message: 'Agent registered successfully',
      agent: {
        id: agent.id,
        fullName: agent.fullName,
        email: agent.email,
        branch: agent.branch,
      },
    });
  } catch (error) {
    console.error('Agent registration error:', error);
    res.status(500).json({ message: 'Agent registration failed', error: error.message });
  }
};

// Update agent
const updateAgent = async (req, res) => {
  try {
    const { id, fullName, phoneNumber, email, password, branch, status } = req.body;

    const agent = await Agent.findByPk(id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email !== agent.email) {
      const existingAgent = await Agent.findOne({ where: { email } });
      if (existingAgent) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    // Hash password if provided
    let hashedPassword = agent.password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update agent
    await agent.update({
      fullName,
      phoneNumber,
      email,
      password: hashedPassword,
    });

    res.json({
      success: true,
      message: 'Agent updated successfully',
      agent: {
        id: agent.id,
        fullName: agent.fullName,
        email: agent.email,
        branch: agent.branch,
      },
    });
  } catch (error) {
    console.error('Agent update error:', error);
    res.status(500).json({ message: 'Agent update failed', error: error.message });
  }
};

// List all agents
const listAgents = async (req, res) => {
  try {
    const agents = await Agent.findAll({
      attributes: ['id', 'fullName', 'phoneNumber', 'email', 'branch', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      message: 'Agents retrieved successfully',
      agents,
    });
  } catch (error) {
    console.error('List agents error:', error);
    res.status(500).json({ message: 'Failed to retrieve agents', error: error.message });
  }
};

// Get agent by ID
const getAgentById = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findByPk(id);

    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    res.json({
      success: true,
      message: 'Agent retrieved successfully',
      agent,
    });
  } catch (error) {
    console.error('Get agent error:', error);
    res.status(500).json({ message: 'Failed to retrieve agent', error: error.message });
  }
};

// Update agent status
const updateAgentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const agent = await Agent.findByPk(id);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Validate status
    const validStatuses = ['Active', 'Inactive', 'Suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Active, Inactive, or Suspended' });
    }

    await agent.update({ status });

    res.json({
      message: 'Agent status updated successfully',
      agent: {
        id: agent.id,
        fullName: agent.fullName,
        status: agent.status,
      },
    });
  } catch (error) {
    console.error('Update agent status error:', error);
    res.status(500).json({ message: 'Failed to update agent status', error: error.message });
  }
};

// Update customer count for an agent
const updateCustomerCount = async (agentId) => {
  try {
    const customerCount = await Customer.count({
      where: { agentId }
    });

    await Agent.update(
      { customersCount: customerCount },
      { where: { id: agentId } }
    );

    return customerCount;
  } catch (error) {
    console.error('Error updating customer count:', error);
    return 0;
  }
};

module.exports = {
  registerAgent,
  updateAgent,
  listAgents,
  getAgentById,
  updateAgentStatus,
  updateCustomerCount,
};
