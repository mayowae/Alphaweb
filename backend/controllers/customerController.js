const { Customer, Agent, Branch, Merchant, Package } = require('../models');

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by customer name, email, or account number
 *       - in: query
 *         name: agentId
 *         schema:
 *           type: integer
 *         description: Filter by agent ID
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: integer
 *         description: Filter by branch ID
 *       - in: query
 *         name: packageId
 *         schema:
 *           type: integer
 *         description: Filter by package ID
 *     responses:
 *       200:
 *         description: List of customers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Customers retrieved successfully"
 *                 customers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - phoneNumber
 *               - email
 *               - agentId
 *               - branchId
 *               - merchantId
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "John Doe"
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348012345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *               alias:
 *                 type: string
 *                 example: "Johnny"
 *               address:
 *                 type: string
 *                 example: "123 Main Street, Lagos, Nigeria"
 *               accountNumber:
 *                 type: string
 *                 example: "ACC123456"
 *               agentId:
 *                 type: integer
 *                 example: 1
 *               branchId:
 *                 type: integer
 *                 example: 1
 *               merchantId:
 *                 type: integer
 *                 example: 1
 *               packageId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Customer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Customer created successfully"
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Bad request - email already exists or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Agent, branch, or merchant not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * /customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Customer retrieved successfully"
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Customer not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               fullName:
 *                 type: string
 *                 example: "John Doe Updated"
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348012345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe.updated@example.com"
 *               alias:
 *                 type: string
 *                 example: "Johnny Updated"
 *               address:
 *                 type: string
 *                 example: "456 New Street, Lagos, Nigeria"
 *               accountNumber:
 *                 type: string
 *                 example: "ACC123456"
 *               agentId:
 *                 type: integer
 *                 example: 1
 *               branchId:
 *                 type: integer
 *                 example: 1
 *               packageId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Customer updated successfully"
 *                 customer:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Bad request - email already taken or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Customer, agent, or branch not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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
