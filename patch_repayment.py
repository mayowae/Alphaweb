import os

target_file = 'live_repaymentController.js'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

target = """    const repayment = await Repayment.create({
      transactionId,
      loanId,
      customerId: customer.id,
      customerName,
      accountNumber: accountNumber || customer.accountNumber || (loan ? loan.accountNumber : null),
      package,
      amount: parseFloat(amount),
      branch,
      agentId: agent ? agent.id : null,
      agentName: agent ? agent.fullName : null,
      merchantId,
      paymentMethod,
      reference,
      notes,
      status: 'Completed'
    });

    // Update loan amount paid and remaining amount
    const currentPaid = parseFloat(loan.amountPaid || 0);
    const payDelta = parseFloat(amount || 0);
    const totalAmt = parseFloat(loan.totalAmount || 0);
    const newAmountPaid = currentPaid + payDelta;
    const newRemainingAmount = Math.max(totalAmt - newAmountPaid, 0);
    

    res.status(201).json({
      success: true,
      message: 'Repayment created successfully',
      data: repayment
    });"""

replacement = """    const transaction = await Repayment.sequelize.transaction();
    try {
      const repayment = await Repayment.create({
        transactionId,
        loanId,
        customerId: customer.id,
        customerName,
        accountNumber: accountNumber || customer.accountNumber || (loan ? loan.accountNumber : null),
        package,
        amount: parseFloat(amount),
        branch,
        agentId: agent ? agent.id : null,
        agentName: agent ? agent.fullName : null,
        merchantId,
        paymentMethod,
        reference,
        notes,
        status: 'Completed'
      }, { transaction });

      // Update loan amount paid and remaining amount
      const currentPaid = parseFloat(loan.amountPaid || 0);
      const payDelta = parseFloat(amount || 0);
      const totalAmt = parseFloat(loan.totalAmount || 0);
      const newAmountPaid = currentPaid + payDelta;
      const newRemainingAmount = Math.max(totalAmt - newAmountPaid, 0);

      await loan.update({
        amountPaid: newAmountPaid,
        remainingAmount: newRemainingAmount,
        status: newRemainingAmount > 0 ? 'Active' : 'Completed'
      }, { transaction });

      // Update Wallet Loan Balance
      const { CustomerWallet } = require('../models');
      let wallet = await CustomerWallet.findOne({ where: { customerId: customer.id, merchantId }, transaction });
      if (wallet) {
        const activeLoans = await Loan.findAll({ where: { customerId: customer.id, merchantId, status: 'Active' }, transaction });
        const totalRemaining = activeLoans.reduce((sum, l) => sum + parseFloat(l.remainingAmount || 0), 0);
        await wallet.update({ loanBalance: totalRemaining }, { transaction });
      }

      // Book double-entry transaction
      const { bookDoubleEntry } = require('../utils/doubleEntry');
      const debitCode = (paymentMethod === 'Bank' || paymentMethod === 'VirtualAccount') ? '100300' : '100400';
      const creditCode = '200550'; // Loan Repayment account
      
      await bookDoubleEntry(merchantId, {
        date: new Date(),
        description: `Loan Repayment for Loan #${loan.id} - Customer: ${customer.fullName}`,
        debitCode,
        creditCode,
        amount: parseFloat(amount),
        transaction
      });

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Repayment created successfully',
        data: repayment
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
    print("SUCCESS: repaymentController successfully patched!")
else:
    print("ERROR: Target content not found in repaymentController.js!")
