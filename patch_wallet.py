import os

target_file = 'live_walletController.js'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

target = """    // Create debit transaction for merchant wallet
    const merchantTransaction = await WalletTransaction.create({
      merchantId,
      type: merchantSideType,
      transactionType: customerSideType,
      amount: parseFloat(amount),
      description: `Transfer ${customerSideType === 'credit' ? 'to' : 'from'} ${customerWallet.customer.fullName}: ${description || 'Wallet transaction'}`,
      reference: `TRF_${Date.now()}`,
      status: 'Completed',
      date: new Date(),
      relatedId: customerWallet.id,
      relatedType: 'customer_wallet',
      paymentMethod: paymentMethod || null
    });

    // Update customer wallet balance
    await customerWallet.update({
      balance: parseFloat(customerWallet.balance) + (customerSideType === 'credit' ? parseFloat(amount) : -parseFloat(amount)),
      lastTransactionDate: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Transfer completed successfully',
      transfer: {
        id: merchantTransaction.id,
        amount,
        customerName: customerWallet.customer.fullName,
        reference: merchantTransaction.reference,
        date: merchantTransaction.date
      }
    });"""

replacement = """    const transaction = await Merchant.sequelize.transaction();
    try {
      // Create debit transaction for merchant wallet
      const merchantTransaction = await WalletTransaction.create({
        merchantId,
        type: merchantSideType,
        transactionType: customerSideType,
        amount: parseFloat(amount),
        description: `Transfer ${customerSideType === 'credit' ? 'to' : 'from'} ${customerWallet.customer.fullName}: ${description || 'Wallet transaction'}`,
        reference: `TRF_${Date.now()}`,
        status: 'Completed',
        date: new Date(),
        relatedId: customerWallet.id,
        relatedType: 'customer_wallet',
        paymentMethod: paymentMethod || null
      }, { transaction });

      // Update customer wallet balance
      await customerWallet.update({
        balance: parseFloat(customerWallet.balance) + (customerSideType === 'credit' ? parseFloat(amount) : -parseFloat(amount)),
        lastTransactionDate: new Date()
      }, { transaction });

      // Book double-entry transaction
      const { bookDoubleEntry } = require('../utils/doubleEntry');
      if (customerSideType === 'credit') {
        // Load Wallet: Debit Wallet, Credit Bank
        await bookDoubleEntry(merchantId, {
          date: new Date(),
          description: `Wallet Funded - Customer: ${customerWallet.customer.fullName}`,
          debitCode: '100200',
          creditCode: '100300',
          amount: parseFloat(amount),
          transaction
        });
      } else {
        // Unload / Payout Wallet: Debit Bank, Credit Wallet
        await bookDoubleEntry(merchantId, {
          date: new Date(),
          description: `Wallet Payout - Customer: ${customerWallet.customer.fullName}`,
          debitCode: '100300',
          creditCode: '100200',
          amount: parseFloat(amount),
          transaction
        });
      }

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: 'Transfer completed successfully',
        transfer: {
          id: merchantTransaction.id,
          amount,
          customerName: customerWallet.customer.fullName,
          reference: merchantTransaction.reference,
          date: merchantTransaction.date
        }
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
    print("SUCCESS: walletController successfully patched!")
else:
    print("ERROR: Target content not found in walletController.js!")
