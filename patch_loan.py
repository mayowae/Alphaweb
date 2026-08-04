import os

target_file = 'live_loanController.js'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

target = """    const loan = await Loan.create({
      customerId,
      loanAmount,
      remainingAmount: loanAmount, // Initial remaining amount is full loan amount
      interestRate,
      duration,
      startDate,
      repaymentFrequency,
      loanType,
      agentId,
      branchId,
      applicationId,
      merchantId,
      status: 'Active' // Default to Active when created from approved application
    });

    // Update Wallet Loan Balance
    const { CustomerWallet } = require('../models');
    let wallet = await CustomerWallet.findOne({ where: { customerId, merchantId } });
    if (wallet) {
      const activeLoans = await Loan.findAll({ where: { customerId, merchantId, status: 'Active' } });
      const totalRemaining = activeLoans.reduce((sum, l) => sum + parseFloat(l.remainingAmount || 0), 0);
      await wallet.update({ loanBalance: totalRemaining });
    }

    res.status(201).json({
      success: true,
      message: 'Loan created successfully',
      data: loan
    });"""

replacement = """    const transaction = await db.sequelize.transaction();
    try {
      const loan = await Loan.create({
        customerId,
        loanAmount,
        remainingAmount: loanAmount, // Initial remaining amount is full loan amount
        interestRate,
        duration,
        startDate,
        repaymentFrequency,
        loanType,
        agentId,
        branchId,
        applicationId,
        merchantId,
        status: 'Active' // Default to Active when created from approved application
      }, { transaction });

      // Update Wallet Loan Balance
      const { CustomerWallet } = require('../models');
      let wallet = await CustomerWallet.findOne({ where: { customerId, merchantId }, transaction });
      if (wallet) {
        const activeLoans = await Loan.findAll({ where: { customerId, merchantId, status: 'Active' }, transaction });
        const totalRemaining = activeLoans.reduce((sum, l) => sum + parseFloat(l.remainingAmount || 0), 0);
        await wallet.update({ loanBalance: totalRemaining }, { transaction });
      }

      // Book double-entry transaction (Disbursement: Debit Customer Loans Liability, Credit Cash)
      const { bookDoubleEntry } = require('../utils/doubleEntry');
      await bookDoubleEntry(merchantId, {
        date: new Date(),
        description: `Loan Disbursed - Loan #${loan.id} (Customer ID: ${customerId})`,
        debitCode: '200500',
        creditCode: '100400',
        amount: parseFloat(loanAmount),
        transaction
      });

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Loan created successfully',
        data: loan
      });
    } catch (innerError) {
      await transaction.rollback();
      throw innerError;
    }"""

content_norm = content.replace('\r\n', '\n')
target_norm = target.replace('\r\n', '\n')
replacement_norm = replacement.replace('\r\n', '\n')

if target_norm in content_norm:
    new_content = content_norm.replace(target_norm, replacement_norm)
    with open(target_file, 'w', encoding='utf-8', newline='') as f:
        f.write(new_content)
    print("SUCCESS: loanController successfully patched!")
else:
    print("ERROR: Target content not found in loanController.js!")
