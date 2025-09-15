const { Customer, Agent, Branch, Merchant, Package } = require('../models');

// Create customer
const createCustomer = async (req, res) => {
  try {
    const { fullName, phoneNumber, email, agentId, branchId, merchantId, packageId, accountNumber, alias, address } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ where: { email } });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Verify agent exists
    const agent = await Agent.findByPk(agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Verify branch exists
    const branch = await Branch.findByPk(branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    // Verify merchant exists
    const merchant = await Merchant.findByPk(merchantId);
    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    // Create customer
    const customer = await Customer.create({
      fullName,
      phoneNumber,
      email,
      alias,
      address,
      agentId,
      branchId,
      merchantId,
      packageId,
      accountNumber,
    });

    res.status(201).json({
      message: 'Customer created successfully',
      customer: {
        id: customer.id,
        accountNumber: customer.accountNumber,
        fullName: customer.fullName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        agentId: customer.agentId,
        branchId: customer.branchId,
      },
    });
  } catch (error) {
    console.error('Customer creation error:', error);
    res.status(500).json({ message: 'Customer creation failed', error: error.message });
  }
};

// List all customers
const listCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      attributes: ['id', 'fullName', 'phoneNumber', 'email', 'alias', 'address', 'accountNumber', 'createdAt', 'agentId', 'branchId', 'packageId'],
      include: [
        {
          model: Agent,
          as: 'Agent',
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: Branch,
          as: 'Branch',
          attributes: ['id', 'name', 'location'],
        },
        {
          model: Package,
          as: 'Package',
          attributes: ['id', 'name'],
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
      message: 'Customers retrieved successfully',
      customers: customers.map(c => ({
        ...c.toJSON(),
        accountNumber: c.accountNumber,
        agentName: c.Agent?.fullName,
        branchName: c.Branch?.name,
        packageName: c.Package?.name,
        dateCreated: c.createdAt,
        status: 'Active',
      })),
    });
  } catch (error) {
    console.error('List customers error:', error);
    res.status(500).json({ message: 'Failed to retrieve customers', error: error.message });
  }
};

// Get customer by ID
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByPk(id, {
      include: [
        {
          model: Agent,
          as: 'Agent',
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: Branch,
          as: 'Branch',
          attributes: ['id', 'name', 'location'],
        },
        {
          model: Merchant,
          as: 'Merchant',
          attributes: ['id', 'businessName'],
        },
      ],
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({
      message: 'Customer retrieved successfully',
      customer,
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ message: 'Failed to retrieve customer', error: error.message });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const { id, fullName, phoneNumber, email, agentId, branchId, packageId, accountNumber, alias, address } = req.body;

    const customer = await Customer.findByPk(id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email !== customer.email) {
      const existingCustomer = await Customer.findOne({ where: { email } });
      if (existingCustomer) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    // Verify agent exists if provided
    if (agentId) {
      const agent = await Agent.findByPk(agentId);
      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
    }

    // Verify branch exists if provided
    if (branchId) {
      const branch = await Branch.findByPk(branchId);
      if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
      }
    }

    // Update customer
    await customer.update({
      fullName,
      phoneNumber,
      email,
      alias,
      address,
      agentId,
      branchId,
      packageId,
      accountNumber,
    });

    res.json({
      message: 'Customer updated successfully',
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        agentId: customer.agentId,
        branchId: customer.branchId,
      },
    });
  } catch (error) {
    console.error('Customer update error:', error);
    res.status(500).json({ message: 'Customer update failed', error: error.message });
  }
};

module.exports = {
  createCustomer,
  listCustomers,
  getCustomerById,
  updateCustomer,
};
