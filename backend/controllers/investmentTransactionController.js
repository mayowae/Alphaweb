const { InvestmentTransaction, Customer, Merchant, Agent, Package, Investment } = require('../models');
const { Op } = require('sequelize');

/**
 * @swagger
 * tags:
 *   - name: Investment Transactions
 *     description: Investment transaction management
 * /investment-transactions:
 *   get:
 *     summary: List investment transactions
 *     tags: [Investment Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: transactionType
 *         schema: { type: string }
 *       - in: query
 *         name: branch
 *         schema: { type: string }
 *       - in: query
 *         name: agentId
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: fromDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: toDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Transactions list
 *   post:
 *     summary: Create investment transaction
 *     tags: [Investment Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer, amount, transactionType]
 *             properties:
 *               customer: { type: string }
 *               accountNumber: { type: string }
 *               package: { type: string }
 *               amount: { type: number, format: float }
 *               branch: { type: string }
 *               agent: { type: string }
 *               transactionType: { type: string }
 *               notes: { type: string }
 * /investment-transactions/{id}:
 *   get:
 *     summary: Get investment transaction by ID
 *     tags: [Investment Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Transaction retrieved
 *   put:
 *     summary: Update investment transaction
 *     tags: [Investment Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *   delete:
 *     summary: Delete investment transaction
 *     tags: [Investment Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Transaction deleted
 */

// Create a new investment transaction
const createInvestmentTransaction = async (req, res) => {
  try {
    const { 
      customer, 
      customerName, 
      phoneNumber,
      email,
      accountNumber, 
      package, 
      amount, 
      branch, 
      agent, 
      transactionType, 
      notes 
    } = req.body;
    
    // Resolve merchantId from authenticated context
    let merchantId = req.user?.merchantId || req.body.merchantId;
    if (!merchantId) {
      if (req.user?.type === 'merchant') {
        merchantId = req.user.id;
      } else if (req.user?.type === 'agent') {
        const agentOwner = await Agent.findByPk(req.user.id);
        merchantId = agentOwner ? agentOwner.merchantId : undefined;
      }
    }
    if (!merchantId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: merchant not identified' });
    }

    // Find customer by accountNumber (preferred), or by case-insensitive name, or phone/email; always scoped to merchant
    const providedNameRaw = customer || customerName;
    const providedName = providedNameRaw ? String(providedNameRaw).trim() : undefined;
    const providedAccountNumber = accountNumber ? String(accountNumber).trim() : undefined;
    const whereClause = { merchantId };
    let customerRecord = null;
    if (providedAccountNumber) {
      customerRecord = await Customer.findOne({ where: { ...whereClause, accountNumber: providedAccountNumber } });
    }
    if (!customerRecord && (providedName || phoneNumber || email)) {
      const nameLike = providedName ? { [Op.iLike]: `%${providedName}%` } : undefined;
      const orFilters = [];
      if (providedName) {
        orFilters.push({ fullName: nameLike });
        orFilters.push({ name: nameLike });
        orFilters.push({ alias: nameLike });
      }
      if (phoneNumber) orFilters.push({ phoneNumber });
      if (email) orFilters.push({ email });
      if (orFilters.length > 0) {
        customerRecord = await Customer.findOne({ where: { ...whereClause, [Op.or]: orFilters } });
      }
    }

    if (!customerRecord) {
      // Secondary unscoped lookup to assist debugging merchant mismatches
      let hint = undefined;
      try {
        const unscopedFilters = [];
        if (providedAccountNumber) unscopedFilters.push({ accountNumber: providedAccountNumber });
        if (providedName) {
          const nameLikeAny = { [Op.iLike]: `%${providedName}%` };
          unscopedFilters.push({ fullName: nameLikeAny });
          unscopedFilters.push({ name: nameLikeAny });
          unscopedFilters.push({ alias: nameLikeAny });
        }
        if (phoneNumber) unscopedFilters.push({ phoneNumber });
        if (email) unscopedFilters.push({ email });
        if (unscopedFilters.length > 0) {
          const foundAny = await Customer.findOne({ where: { [Op.or]: unscopedFilters } });
          if (foundAny) {
            hint = {
              possibleMatchExists: true,
              customerId: foundAny.id,
              customerMerchantId: foundAny.merchantId,
              reason: 'A matching customer exists under a different merchant.'
            };
          }
        }
      } catch {}

      return res.status(404).json({
        success: false,
        message: 'Customer not found',
        details: {
          searched: {
            accountNumber: providedAccountNumber || null,
            name: providedName || null,
            phoneNumber: phoneNumber || null,
            email: email || null,
          },
          hint
        }
      });
    }

    // If logged in as agent, auto-populate agent name and branch unless provided
    let agentName = agent || '';
    let branchName = branch || '';
    if (req.user?.type === 'agent') {
      try {
        const agentRecord = await Agent.findByPk(req.user.id);
        if (agentRecord) {
          if (!agentName) agentName = agentRecord.fullName || agentRecord.name || '';
          if (!branchName) branchName = agentRecord.branch || '';
        }
      } catch {}
    }

    const investedAmount = parseFloat(amount);
    const packageName = package || '';

    // Handle advance payment logic for deposit transactions with investment packages
    if (transactionType === 'deposit' && packageName) {
      // Find the investment package to get daily amount
      const investmentPackage = await Package.findOne({
        where: {
          name: packageName,
          merchantId: merchantId,
          packageCategory: 'Investment'
        }
      });

      if (investmentPackage && investmentPackage.amount > 0) {
        const dailyAmount = parseFloat(investmentPackage.amount);
        const daysCovered = Math.floor(investedAmount / dailyAmount);
        const remainingAmount = investedAmount % dailyAmount;

        if (daysCovered > 0) {
          // Get existing deposit transactions for this customer and package to determine which days are covered
          const existingTransactions = await InvestmentTransaction.findAll({
            where: {
              customerId: customerRecord.id,
              package: packageName,
              transactionType: 'deposit',
              merchantId: merchantId,
              status: 'completed'
            },
            order: [['transactionDate', 'DESC']]
          });

          // Check if customer has any active investment plan
          // A customer can only have one active investment plan at a time
          const activeInvestment = await Investment.findOne({
            where: {
              customerId: customerRecord.id,
              status: 'Active',
              merchantId: merchantId
            }
          });

          // If customer has an active investment, validate the transaction
          if (activeInvestment) {
            // If the active investment is for a different package, block the transaction
            // Customer cannot pay for a new plan until the current one is fully completed
            if (activeInvestment.plan !== packageName) {
              return res.status(400).json({
                success: false,
                message: 'Transaction failed. Investment number of days exceeded.'
              });
            }

            // If it's the same package, check if the new payment would exceed the duration
            const packageDuration = investmentPackage.duration ? parseInt(investmentPackage.duration) : null;
            
            if (packageDuration && packageDuration > 0) {
              // Count how many days are already covered by existing transactions for this package
              // Each transaction with amount equal to dailyAmount represents one day
              let existingDaysCovered = 0;
              for (const tx of existingTransactions) {
                const txAmount = parseFloat(tx.amount);
                if (txAmount >= dailyAmount) {
                  // Count full days (transactions that are at least the daily amount)
                  existingDaysCovered += Math.floor(txAmount / dailyAmount);
                }
              }

              // Calculate total days that would be covered after this transaction
              const totalDaysCovered = existingDaysCovered + daysCovered;

              // Block transaction if it would exceed the package duration
              if (totalDaysCovered > packageDuration) {
                return res.status(400).json({
                  success: false,
                  message: 'Transaction failed. Investment number of days exceeded.'
                });
              }
            }
          }

          // Calculate the next available date
          // Start from today, or the day after the furthest future date already covered
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          let nextDate = new Date(today);
          if (existingTransactions.length > 0) {
            // Find the maximum (furthest future) transaction date
            let maxDate = new Date(existingTransactions[0].transactionDate);
            maxDate.setHours(0, 0, 0, 0);
            
            for (const tx of existingTransactions) {
              const txDate = new Date(tx.transactionDate);
              txDate.setHours(0, 0, 0, 0);
              if (txDate > maxDate) {
                maxDate = txDate;
              }
            }
            
            // Start from the day after the furthest future date
            nextDate = new Date(maxDate);
            nextDate.setDate(nextDate.getDate() + 1);
            
            // If the calculated next date is in the past, start from today
            if (nextDate < today) {
              nextDate = new Date(today);
            }
          }

          // Create transactions for each day covered
          const transactions = [];
          for (let i = 0; i < daysCovered; i++) {
            const transactionDate = new Date(nextDate);
            transactionDate.setDate(nextDate.getDate() + i);
            
            const transaction = await InvestmentTransaction.create({
              customerId: customerRecord.id,
              customer: customer || customerRecord.fullName || customerRecord.name,
              accountNumber: accountNumber || customerRecord.accountNumber,
              package: packageName,
              amount: dailyAmount,
              branch: branchName,
              agent: agentName,
              transactionType: 'deposit',
              notes: notes || (i === 0 ? `Advance payment covering ${daysCovered} days` : `Day ${i + 1} of advance payment`),
              merchantId,
              status: 'completed',
              transactionDate: transactionDate
            });
            transactions.push(transaction);
          }

          // If there's a remainder, create a transaction for it on the day after the last covered day
          if (remainingAmount > 0) {
            const remainderDate = new Date(nextDate);
            remainderDate.setDate(nextDate.getDate() + daysCovered);
            
            const remainderTransaction = await InvestmentTransaction.create({
              customerId: customerRecord.id,
              customer: customer || customerRecord.fullName || customerRecord.name,
              accountNumber: accountNumber || customerRecord.accountNumber,
              package: packageName,
              amount: remainingAmount,
              branch: branchName,
              agent: agentName,
              transactionType: 'deposit',
              notes: notes || `Partial payment remainder (${daysCovered} full days covered, ${remainingAmount.toFixed(2)} remainder)`,
              merchantId,
              status: 'completed',
              transactionDate: remainderDate
            });
            transactions.push(remainderTransaction);
          }

          return res.status(201).json({
            success: true,
            message: `Investment transaction created successfully. Amount covers ${daysCovered} day(s)${remainingAmount > 0 ? ` with ${remainingAmount.toFixed(2)} remainder` : ''}`,
            transactions,
            daysCovered,
            remainingAmount: remainingAmount > 0 ? remainingAmount : null
          });
        }
      }
    }

    // Default behavior: create a single transaction (for non-deposit or packages without daily amount)
    const transaction = await InvestmentTransaction.create({
      customerId: customerRecord.id,
      customer: customer || customerRecord.fullName || customerRecord.name,
      accountNumber: accountNumber || customerRecord.accountNumber,
      package: packageName,
      amount: investedAmount,
      branch: branchName,
      agent: agentName,
      transactionType,
      notes: notes || '',
      merchantId,
      status: 'completed' // Default to completed for now
    });

    res.status(201).json({
      success: true,
      message: 'Investment transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Error creating investment transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create investment transaction',
      error: error.message
    });
  }
};

// Get all investment transactions for a merchant
const getInvestmentTransactions = async (req, res) => {
  try {
    // Resolve merchantId for both merchants and agents
    let merchantId = req.user?.merchantId;
    if (!merchantId) {
      if (req.user?.type === 'merchant') {
        merchantId = req.user.id;
      } else if (req.user?.type === 'agent') {
        const agentOwner = await Agent.findByPk(req.user.id);
        merchantId = agentOwner ? agentOwner.merchantId : undefined;
      }
    }
    if (!merchantId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: merchant not identified' });
    }
    const { 
      status, 
      search, 
      fromDate, 
      toDate, 
      page = 1, 
      limit = 10,
      agentId,
      branch,
      transactionType
    } = req.query;

    const whereClause = { merchantId };
    
    // Add filters
    if (status) {
      whereClause.status = status;
    }
    
    if (transactionType) {
      whereClause.transactionType = transactionType;
    }
    
    if (branch) {
      whereClause.branch = { [Op.iLike]: `%${branch}%` };
    }
    
    if (agentId) {
      whereClause.agent = { [Op.iLike]: `%${agentId}%` };
    }
    
    if (search) {
      whereClause[Op.or] = [
        { customer: { [Op.iLike]: `%${search}%` } },
        { accountNumber: { [Op.iLike]: `%${search}%` } },
        { package: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (fromDate && toDate) {
      whereClause.transactionDate = {
        [Op.between]: [new Date(fromDate), new Date(toDate)]
      };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { count, rows: transactions } = await InvestmentTransaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          attributes: ['id', 'fullName', 'email', 'phoneNumber']
        }
      ],
      order: [['transactionDate', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      transactions,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching investment transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investment transactions',
      error: error.message
    });
  }
};

// Get investment transaction by ID
const getInvestmentTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    // Resolve merchantId for both merchants and agents
    let merchantId = req.user?.merchantId;
    if (!merchantId) {
      if (req.user?.type === 'merchant') {
        merchantId = req.user.id;
      } else if (req.user?.type === 'agent') {
        const agentOwner = await Agent.findByPk(req.user.id);
        merchantId = agentOwner ? agentOwner.merchantId : undefined;
      }
    }

    const transaction = await InvestmentTransaction.findOne({
      where: { 
        id: id,
        merchantId: merchantId 
      },
      include: [
        {
          model: Customer,
          attributes: ['id', 'fullName', 'email', 'phoneNumber']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Investment transaction not found'
      });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Error fetching investment transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investment transaction',
      error: error.message
    });
  }
};

// Update investment transaction
const updateInvestmentTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    // Resolve merchantId for both merchants and agents
    let merchantId = req.user?.merchantId;
    if (!merchantId) {
      if (req.user?.type === 'merchant') {
        merchantId = req.user.id;
      } else if (req.user?.type === 'agent') {
        const agentOwner = await Agent.findByPk(req.user.id);
        merchantId = agentOwner ? agentOwner.merchantId : undefined;
      }
    }
    const updateData = req.body;

    const transaction = await InvestmentTransaction.findOne({
      where: { 
        id: id,
        merchantId: merchantId 
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Investment transaction not found'
      });
    }

    // Update transaction
    await transaction.update(updateData);

    res.json({
      success: true,
      message: 'Investment transaction updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Error updating investment transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update investment transaction',
      error: error.message
    });
  }
};

// Delete investment transaction
const deleteInvestmentTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    // Resolve merchantId for both merchants and agents
    let merchantId = req.user?.merchantId;
    if (!merchantId) {
      if (req.user?.type === 'merchant') {
        merchantId = req.user.id;
      } else if (req.user?.type === 'agent') {
        const agentOwner = await Agent.findByPk(req.user.id);
        merchantId = agentOwner ? agentOwner.merchantId : undefined;
      }
    }

    const transaction = await InvestmentTransaction.findOne({
      where: { 
        id: id,
        merchantId: merchantId 
      }
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Investment transaction not found'
      });
    }

    await transaction.destroy();

    res.json({
      success: true,
      message: 'Investment transaction deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting investment transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete investment transaction',
      error: error.message
    });
  }
};

module.exports = {
  createInvestmentTransaction,
  getInvestmentTransactions,
  getInvestmentTransactionById,
  updateInvestmentTransaction,
  deleteInvestmentTransaction
};
