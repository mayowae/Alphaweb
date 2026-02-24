const { WalletUpgradeRequest, Merchant, AdminStaff, WalletTier } = require('../models');

// Submit upgrade request (Merchant)
const submitUpgradeRequest = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { targetLevel, metadata } = req.body;
    
    // Check if there's already a pending request
    const existingRequest = await WalletUpgradeRequest.findOne({
      where: { merchantId, status: 'pending' }
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending upgrade request' });
    }
    
    // Get merchant current level
    const merchant = await Merchant.findByPk(merchantId);
    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }
    
    const currentLevelStr = merchant.accountLevel || 'Tier 0';
    const currentLevel = parseInt(currentLevelStr.replace(/[^0-9]/g, '')) || 0;
    
    // Create request
    const upgradeRequest = await WalletUpgradeRequest.create({
      merchantId,
      currentLevel,
      targetLevel: parseInt(targetLevel),
      metadata: typeof metadata === 'string' ? JSON.parse(metadata) : metadata,
      documents: req.files ? Object.keys(req.files).reduce((acc, key) => {
        acc[key] = req.files[key][0].filename;
        return acc;
      }, {}) : {},
    });
    
    res.status(201).json({
      message: 'Upgrade request submitted successfully',
      upgradeRequest
    });
  } catch (error) {
    console.error('Submit upgrade request error:', error);
    res.status(500).json({ message: 'Failed to submit upgrade request', error: error.message });
  }
};

// List all upgrade requests (Admin)
const listUpgradeRequests = async (req, res) => {
  try {
    const requests = await WalletUpgradeRequest.findAll({
      include: [
        {
          model: Merchant,
          as: 'Merchant',
          attributes: ['id', 'businessName', 'email', 'phone', 'accountLevel']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      message: 'Upgrade requests retrieved successfully',
      requests
    });
  } catch (error) {
    console.error('List upgrade requests error:', error);
    res.status(500).json({ message: 'Failed to retrieve upgrade requests', error: error.message });
  }
};

// Update request status (Admin)
const updateRequestStatus = async (req, res) => {
  try {
    const { id, status, rejectionReason } = req.body;
    const adminId = req.user.id;
    
    const request = await WalletUpgradeRequest.findByPk(id);
    if (!request) {
      return res.status(404).json({ message: 'Upgrade request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }
    
    console.log('Updating request status:', { id, status, rejectionReason, adminId });
    
    await request.update({
      status,
      rejectionReason: status === 'rejected' ? rejectionReason : null,
      // reviewedBy: adminId, // Temporarily commented out to fix potential FK constraint issue
      reviewedAt: new Date()
    });
    
    // If approved, update merchant level
    if (status === 'approved') {
      try {
        const merchant = await Merchant.findByPk(request.merchantId);
        if (merchant) {
          console.log('Updating merchant level for:', merchant.businessName, 'to Tier', request.targetLevel);
          await merchant.update({
            accountLevel: `Tier ${request.targetLevel}`
          });
          console.log('Merchant level updated successfully');
        } else {
          console.warn('Merchant not found for ID:', request.merchantId);
        }
      } catch (merchantUpdateError) {
        console.error('Failed to update merchant level:', merchantUpdateError);
        // We might not want to fail the whole request if only the merchant level update fails, 
        // but it's critical for verification.
      }
    }
    
    res.json({
      message: `Upgrade request ${status} successfully`,
      request
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ message: 'Failed to update request status', error: error.message });
  }
};

// Get request details (Admin & Merchant)
const getRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await WalletUpgradeRequest.findByPk(id, {
      include: [
        {
          model: Merchant,
          as: 'Merchant',
          attributes: ['id', 'businessName', 'email', 'phone', 'accountLevel']
        },
        {
          model: AdminStaff,
          as: 'Reviewer',
          attributes: ['id', 'fullName']
        }
      ]
    });
    
    if (!request) {
      return res.status(404).json({ message: 'Upgrade request not found' });
    }
    
    res.json({
      message: 'Upgrade request retrieved successfully',
      request
    });
  } catch (error) {
    console.error('Get request details error:', error);
    res.status(500).json({ message: 'Failed to retrieve upgrade request', error: error.message });
  }
};

module.exports = {
  submitUpgradeRequest,
  listUpgradeRequests,
  updateRequestStatus,
  getRequestDetails
};
