import os

target_file = 'live_remittanceController.js'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

target = """    if (!wallet) {
      wallet = await CustomerWallet.create({
        customerId,
        merchantId,
        accountNumber: customerAccountNumber || `CW${Date.now()}`,
        balance: newBalance,
        status: 'Active',
        activationDate: new Date()
      }, { transaction });
    } else {
    }"""

replacement = """    if (!wallet) {
      wallet = await CustomerWallet.create({
        customerId,
        merchantId,
        accountNumber: customerAccountNumber || `CW${Date.now()}`,
        balance: newBalance,
        status: 'Active',
        activationDate: new Date()
      }, { transaction });
    } else {
      oldBalance = parseFloat(wallet.balance || 0);
      newBalance = oldBalance + parseFloat(remittance.amount);
      await wallet.update({ balance: newBalance }, { transaction });
    }

    // Step 4.5: Book double-entry transaction
    const { bookDoubleEntry } = require('../utils/doubleEntry');
    const debitCode = (remittance.source === 'Bank' || remittance.source === 'VirtualAccount') ? '100300' : '100400';
    let creditCode = '200100';
    if (remittance.collectionId) {
      const linkedCollection = await Collection.findByPk(remittance.collectionId, { transaction });
      if (linkedCollection) {
        if (linkedCollection.type === 'Target') {
          creditCode = '200200';
        } else if (linkedCollection.type === 'Investment' || linkedCollection.type === 'Fixed') {
          creditCode = '200300';
        }
      }
    }
    
    await bookDoubleEntry(merchantId, {
      date: new Date(),
      description: `Collection Remittance #${remittance.id} Approved - Customer: ${remittanceWithCustomer.customer?.fullName || 'N/A'}`,
      debitCode,
      creditCode,
      amount: remittance.amount,
      transaction
    });"""

# Normalize line endings to find the match
content_norm = content.replace('\r\n', '\n')
target_norm = target.replace('\r\n', '\n')
replacement_norm = replacement.replace('\r\n', '\n')

if target_norm in content_norm:
    new_content = content_norm.replace(target_norm, replacement_norm)
    # Write back with original endings
    with open(target_file, 'w', encoding='utf-8', newline='') as f:
        f.write(new_content)
    print("SUCCESS: remittanceController successfully patched!")
else:
    print("ERROR: Target content not found in remittanceController.js!")
