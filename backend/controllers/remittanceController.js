const { Remittance, Customer, Agent } = require('../models');

/**
 * @swagger
 * tags:
 *   - name: Remittances
 *     description: Remittances management
 * /remittances:
 *   get:
 *     summary: List remittances
 *     tags: [Remittances]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Remittances list
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               remittances:
 *                 - id: 41
 *                   customerName: "John Doe"
 *                   amount: 25000
 *                   status: "Pending"
 *   post:
 *     summary: Create remittance
 *     responses:
 *       201:
 *         description: Remittance created
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Remittance created"
 *               remittance:
 *                 id: 42
 *                 customerName: "Jane Doe"
 *                 amount: 30000
 *                 status: "Pending"
 *     tags: [Remittances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerId, amount]
 *             properties:
 *               collectionId: { type: integer }
 *               customerId: { type: integer }
 *               amount: { type: number, format: float }
 *               notes: { type: string }
 *   put:
 *     summary: Update remittance
 *     tags: [Remittances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id: { type: integer }
 *               amount: { type: number, format: float }
 *               notes: { type: string }
 * /remittances/{id}:
 *   get:
 *     summary: Get remittance by ID
 *     tags: [Remittances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Remittance retrieved
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               remittance:
 *                 id: 41
 *                 customerName: "John Doe"
 *                 amount: 25000
 *                 status: "Pending"
 *   delete:
 *     summary: Delete remittance
 *     tags: [Remittances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Remittance deleted
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Remittance deleted"
 * /remittances/{id}/approve:
 *   patch:
 *     summary: Approve remittance
 *     tags: [Remittances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Remittance approved
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Remittance approved"
 *               remittance:
 *                 id: 41
 *                 status: "Approved"
 *
 */

const createRemittance = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { collectionId, customerId, amount, notes } = req.body;
    const customer = await Customer.findOne({ where: { id: customerId, merchantId } });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const remittance = await Remittance.create({
      collectionId: collectionId || null,
      customerId: customer.id,
      customerName: customer.fullName,
      accountNumber: customer.accountNumber || null,
      amount: parseFloat(amount),
      agentId: customer.agentId || null,
      agentName: undefined,
      merchantId,
      status: 'Pending',
      notes: notes || null
    });
    res.status(201).json({ success: true, message: 'Remittance created', remittance });
  } catch (error) {
    console.error('createRemittance error:', error);
    res.status(500).json({ success: false, message: 'Failed to create remittance', error: error.message });
  }
};

const listRemittances = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const remittances = await Remittance.findAll({
      where: { merchantId },
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'fullName', 'accountNumber'] },
        { model: Agent, as: 'agent', attributes: ['id', 'fullName'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, remittances });
  } catch (error) {
    console.error('listRemittances error:', error);
    res.status(500).json({ success: false, message: 'Failed to list remittances', error: error.message });
  }
};

const getRemittanceById = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { id } = req.params;
    const remittance = await Remittance.findOne({
      where: { id, merchantId },
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'fullName', 'accountNumber'] },
        { model: Agent, as: 'agent', attributes: ['id', 'fullName'] }
      ]
    });
    if (!remittance) return res.status(404).json({ success: false, message: 'Remittance not found' });
    res.json({ success: true, remittance });
  } catch (error) {
    console.error('getRemittanceById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch remittance', error: error.message });
  }
};

const updateRemittance = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { id, amount, notes } = req.body;
    const remittance = await Remittance.findOne({ where: { id, merchantId } });
    if (!remittance) return res.status(404).json({ success: false, message: 'Remittance not found' });
    await remittance.update({
      amount: amount !== undefined ? parseFloat(amount) : remittance.amount,
      notes: notes !== undefined ? notes : remittance.notes
    });
    res.json({ success: true, message: 'Remittance updated', remittance });
  } catch (error) {
    console.error('updateRemittance error:', error);
    res.status(500).json({ success: false, message: 'Failed to update remittance', error: error.message });
  }
};

const approveRemittance = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { id } = req.params;
    const remittance = await Remittance.findOne({ where: { id, merchantId } });
    if (!remittance) return res.status(404).json({ success: false, message: 'Remittance not found' });
    await remittance.update({ status: 'Approved', approvedAt: new Date() });
    res.json({ success: true, message: 'Remittance approved', remittance });
  } catch (error) {
    console.error('approveRemittance error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve remittance', error: error.message });
  }
};

const deleteRemittance = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { id } = req.params;
    const remittance = await Remittance.findOne({ where: { id, merchantId } });
    if (!remittance) return res.status(404).json({ success: false, message: 'Remittance not found' });
    await remittance.destroy();
    res.json({ success: true, message: 'Remittance deleted' });
  } catch (error) {
    console.error('deleteRemittance error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete remittance', error: error.message });
  }
};

module.exports = { createRemittance, listRemittances, getRemittanceById, updateRemittance, approveRemittance, deleteRemittance };


