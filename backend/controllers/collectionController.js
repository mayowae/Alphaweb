const { Collection, Customer, Agent } = require('../models');
const { Op, Sequelize } = require('sequelize');

// Create a new collection
const createCollection = async (req, res) => {
  try {
    const { 
      customerName, 
      amount, 
      dueDate, 
      type, 
      description,
      packageName,
      packageAmount,
      cycle,
      cycleCounter,
      isFirstCollection
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

    const collection = await Collection.create({
      customerId: customer.id,
      customerName,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      type,
      description: description || '',
      packageName: packageName || '',
      packageAmount: packageAmount ? parseFloat(packageAmount) : null,
      cycle: cycle ? parseInt(cycle) : 31,
      cycleCounter: cycleCounter ? parseInt(cycleCounter) : 1,
      isFirstCollection: isFirstCollection === 'true' || isFirstCollection === true,
      status: 'Pending',
      merchantId,
      dateCreated: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Collection created successfully',
      collection
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create collection',
      error: error.message
    });
  }
};

// Get all collections for a merchant
const getCollections = async (req, res) => {
  try {
    const merchantId = req.user.id;

    const collections = await Collection.findAll({
      where: { merchantId },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'email', 'phoneNumber', 'accountNumber', 'agentId'],
          include: [
            {
              model: Agent,
              as: 'Agent',
              attributes: ['id', 'fullName']
            }
          ]
        }
      ],
      // Ensure unique rows when using JOINs
      distinct: true,
      subQuery: false,
      // Order by physical column to avoid createdAt mapping issues
      order: [[Sequelize.col('date_created'), 'DESC']]
    });

    // Normalize response to include top-level accountNumber and packageName for frontend
    const normalized = collections.map((c) => {
      const json = c.toJSON();
      json.accountNumber = json?.customer?.accountNumber || null;
      json.packageName = json?.packageName || null;
      return json;
    });

    res.json({
      success: true,
      collections: normalized
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collections',
      error: error.message
    });
  }
};

// Get collection by ID
const getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const collection = await Collection.findOne({
      where: { 
        id,
        merchantId 
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'email', 'phoneNumber']
        }
      ]
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    res.json({
      success: true,
      collection
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collection',
      error: error.message
    });
  }
};

// Update collection
const updateCollection = async (req, res) => {
  try {
    const { id, customerName, amount, dueDate, type, status, description } = req.body;
    const merchantId = req.user.id;

    const collection = await Collection.findOne({
      where: { 
        id,
        merchantId 
      }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    await collection.update({
      customerName: customerName || collection.customerName,
      amount: amount ? parseFloat(amount) : collection.amount,
      dueDate: dueDate ? new Date(dueDate) : collection.dueDate,
      type: type || collection.type,
      status: status || collection.status,
      description: description !== undefined ? description : collection.description,
      collectedDate: status === 'Collected' ? new Date() : collection.collectedDate
    });

    res.json({
      success: true,
      message: 'Collection updated successfully',
      collection
    });
  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update collection',
      error: error.message
    });
  }
};

// Mark collection as collected
const markAsCollected = async (req, res) => {
  try {
    const { id } = req.params;
    const { amountCollected, collectionNotes } = req.body;
    const merchantId = req.user.id;

    const collection = await Collection.findOne({
      where: { 
        id,
        merchantId 
      }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    await collection.update({
      status: 'Collected',
      collectedDate: new Date(),
      amountCollected: amountCollected ? parseFloat(amountCollected) : collection.amount,
      collectionNotes: collectionNotes || ''
    });

    res.json({
      success: true,
      message: 'Collection marked as collected',
      collection
    });
  } catch (error) {
    console.error('Error marking collection as collected:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark collection as collected',
      error: error.message
    });
  }
};

// Delete collection (soft delete)
const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const merchantId = req.user.id;

    const collection = await Collection.findOne({
      where: { 
        id,
        merchantId 
      }
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    await collection.update({ status: 'Deleted' });

    res.json({
      success: true,
      message: 'Collection deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete collection',
      error: error.message
    });
  }
};

// Get collections by status
const getCollectionsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const merchantId = req.user.id;

    const collections = await Collection.findAll({
      where: { 
        merchantId,
        status
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'email', 'phoneNumber']
        }
      ],
      order: [['dueDate', 'ASC']]
    });

    res.json({
      success: true,
      collections
    });
  } catch (error) {
    console.error('Error fetching collections by status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collections by status',
      error: error.message
    });
  }
};

// Get overdue collections
const getOverdueCollections = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const today = new Date();

    const collections = await Collection.findAll({
      where: { 
        merchantId,
        status: 'Pending',
        dueDate: {
          [Op.lt]: today
        }
      },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'fullName', 'email', 'phoneNumber']
        }
      ],
      order: [['dueDate', 'ASC']]
    });

    res.json({
      success: true,
      collections
    });
  } catch (error) {
    console.error('Error fetching overdue collections:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue collections',
      error: error.message
    });
  }
};

module.exports = {
  createCollection,
  getCollections,
  getCollectionById,
  updateCollection,
  markAsCollected,
  deleteCollection,
  getCollectionsByStatus,
  getOverdueCollections
};
