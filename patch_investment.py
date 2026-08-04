import os

target_file = 'live_investmentTransactionController.js'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. We inject dbTransaction initialization right after packageName resolution
target_init = """    const investedAmount = parseFloat(amount);
    const packageName = package || '';"""

replacement_init = """    const investedAmount = parseFloat(amount);
    const packageName = package || '';

    const dbTransaction = await InvestmentTransaction.sequelize.transaction();"""

# 2. Update advance deposits loops to include dbTransaction and book double entries
target_advance_loop = """            const createdTransactions = [];
            for (let i = 0; i < daysCovered; i++) {
              const txDate = new Date(nextDate);
              txDate.setDate(nextDate.getDate() + i);
              
              const tx = await InvestmentTransaction.create({
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
                transactionDate: txDate
              });
              createdTransactions.push(tx);

              // Generate interest transaction
              if (interestRate > 0) {
                const interestAmt = dailyAmount * (interestRate / 100);
                await InvestmentTransaction.create({
                  customerId: customerRecord.id,
                  customer: customer || customerRecord.fullName || customerRecord.name,
                  accountNumber: accountNumber || customerRecord.accountNumber,
                  package: packageName,
                  amount: interestAmt,
                  branch: branchName,
                  agent: agentName,
                  transactionType: 'interest',
                  notes: `% Interests transaction on deposit #${tx.id}`,
                  merchantId,
                  status: 'completed',
                  transactionDate: txDate
                });
              }
            }

            if (remainingAmount > 0) {
              const txDate = new Date(nextDate);
              txDate.setDate(nextDate.getDate() + daysCovered);
              const remTx = await InvestmentTransaction.create({
                customerId: customerRecord.id,
                customer: customer || customerRecord.fullName || customerRecord.name,
                accountNumber: accountNumber || customerRecord.accountNumber,
                package: packageName,
                amount: remainingAmount,
                branch: branchName,
                agent: agentName,
                transactionType: 'deposit',
                notes: notes || `Partial payment remainder`,
                merchantId,
                status: 'completed',
                transactionDate: txDate
              });
              createdTransactions.push(remTx);

              if (interestRate > 0) {
                const interestAmt = remainingAmount * (interestRate / 100);
                await InvestmentTransaction.create({
                  customerId: customerRecord.id,
                  customer: customer || customerRecord.fullName || customerRecord.name,
                  accountNumber: accountNumber || customerRecord.accountNumber,
                  package: packageName,
                  amount: interestAmt,
                  branch: branchName,
                  agent: agentName,
                  transactionType: 'interest',
                  notes: `% Interests transaction on remainder deposit #${remTx.id}`,
                  merchantId,
                  status: 'completed',
                  transactionDate: txDate
                });
              }
            }

            return res.status(201).json({
              success: true,
              message: `Investment transaction created successfully. Amount covers ${daysCovered} day(s).`,
              transactions: createdTransactions
            });"""

replacement_advance_loop = """            const { bookDoubleEntry } = require('../utils/doubleEntry');
            const createdTransactions = [];
            for (let i = 0; i < daysCovered; i++) {
              const txDate = new Date(nextDate);
              txDate.setDate(nextDate.getDate() + i);
              
              const tx = await InvestmentTransaction.create({
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
                transactionDate: txDate
              }, { transaction: dbTransaction });
              createdTransactions.push(tx);

              // Book double-entry for deposit
              await bookDoubleEntry(merchantId, {
                date: txDate,
                description: `Investment Deposit (Advance Day ${i+1}) - Package: ${packageName}`,
                debitCode: '100400',
                creditCode: '200300',
                amount: dailyAmount,
                transaction: dbTransaction
              });

              // Generate interest transaction
              if (interestRate > 0) {
                const interestAmt = dailyAmount * (interestRate / 100);
                const intTx = await InvestmentTransaction.create({
                  customerId: customerRecord.id,
                  customer: customer || customerRecord.fullName || customerRecord.name,
                  accountNumber: accountNumber || customerRecord.accountNumber,
                  package: packageName,
                  amount: interestAmt,
                  branch: branchName,
                  agent: agentName,
                  transactionType: 'interest',
                  notes: `% Interests transaction on deposit #${tx.id}`,
                  merchantId,
                  status: 'completed',
                  transactionDate: txDate
                }, { transaction: dbTransaction });

                // Book double-entry for interest
                await bookDoubleEntry(merchantId, {
                  date: txDate,
                  description: `Interest Accrued on Deposit #${tx.id}`,
                  debitCode: '500300',
                  creditCode: '200300',
                  amount: interestAmt,
                  transaction: dbTransaction
                });
              }
            }

            if (remainingAmount > 0) {
              const txDate = new Date(nextDate);
              txDate.setDate(nextDate.getDate() + daysCovered);
              const remTx = await InvestmentTransaction.create({
                customerId: customerRecord.id,
                customer: customer || customerRecord.fullName || customerRecord.name,
                accountNumber: accountNumber || customerRecord.accountNumber,
                package: packageName,
                amount: remainingAmount,
                branch: branchName,
                agent: agentName,
                transactionType: 'deposit',
                notes: notes || `Partial payment remainder`,
                merchantId,
                status: 'completed',
                transactionDate: txDate
              }, { transaction: dbTransaction });
              createdTransactions.push(remTx);

              // Book double-entry for remainder deposit
              await bookDoubleEntry(merchantId, {
                date: txDate,
                description: `Investment Deposit Remainder - Package: ${packageName}`,
                debitCode: '100400',
                creditCode: '200300',
                amount: remainingAmount,
                transaction: dbTransaction
              });

              if (interestRate > 0) {
                const interestAmt = remainingAmount * (interestRate / 100);
                const intRemTx = await InvestmentTransaction.create({
                  customerId: customerRecord.id,
                  customer: customer || customerRecord.fullName || customerRecord.name,
                  accountNumber: accountNumber || customerRecord.accountNumber,
                  package: packageName,
                  amount: interestAmt,
                  branch: branchName,
                  agent: agentName,
                  transactionType: 'interest',
                  notes: `% Interests transaction on remainder deposit #${remTx.id}`,
                  merchantId,
                  status: 'completed',
                  transactionDate: txDate
                }, { transaction: dbTransaction });

                // Book double-entry for remainder interest
                await bookDoubleEntry(merchantId, {
                  date: txDate,
                  description: `Interest Accrued on Remainder Deposit #${remTx.id}`,
                  debitCode: '500300',
                  creditCode: '200300',
                  amount: interestAmt,
                  transaction: dbTransaction
                });
              }
            }

            await dbTransaction.commit();
            return res.status(201).json({
              success: true,
              message: `Investment transaction created successfully. Amount covers ${daysCovered} day(s).`,
              transactions: createdTransactions
            });"""

# 3. Update default paths at the end of the function to use transaction and book double entries
target_default = """    // Default behavior (non-advance payment or withdrawal/interest/penalty)
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
      status: 'completed'
    });

    // Generate interest for single deposit
    if (transactionType === 'deposit' && packageName) {
      const investmentPackage = await Package.findOne({
        where: { name: packageName, merchantId: merchantId, packageCategory: 'Investment' }
      });
      if (investmentPackage && parseFloat(investmentPackage.interestRate) > 0) {
        const interestAmt = investedAmount * (parseFloat(investmentPackage.interestRate) / 100);
        await InvestmentTransaction.create({
          customerId: customerRecord.id,
          customer: customer || customerRecord.fullName || customerRecord.name,
          accountNumber: accountNumber || customerRecord.accountNumber,
          package: packageName,
          amount: interestAmt,
          branch: branchName,
          agent: agentName,
          transactionType: 'interest',
          notes: `% Interests transaction on deposit #${transaction.id}`,
          merchantId,
          status: 'completed',
          transactionDate: transaction.transactionDate
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Investment transaction created successfully',
      transaction
    });"""

replacement_default = """    // Default behavior (non-advance payment or withdrawal/interest/penalty)
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
      status: 'completed'
    }, { transaction: dbTransaction });

    const { bookDoubleEntry } = require('../utils/doubleEntry');

    // Book double-entry for single transaction
    if (transactionType === 'deposit') {
      await bookDoubleEntry(merchantId, {
        date: transaction.transactionDate || new Date(),
        description: `Investment Deposit - Package: ${packageName}`,
        debitCode: '100400',
        creditCode: '200300',
        amount: investedAmount,
        transaction: dbTransaction
      });
    } else if (transactionType === 'withdrawal') {
      await bookDoubleEntry(merchantId, {
        date: transaction.transactionDate || new Date(),
        description: `Investment Withdrawal - Package: ${packageName}`,
        debitCode: '200300',
        creditCode: '100400',
        amount: investedAmount,
        transaction: dbTransaction
      });
    }

    // Generate interest for single deposit
    if (transactionType === 'deposit' && packageName) {
      const investmentPackage = await Package.findOne({
        where: { name: packageName, merchantId: merchantId, packageCategory: 'Investment' },
        transaction: dbTransaction
      });
      if (investmentPackage && parseFloat(investmentPackage.interestRate) > 0) {
        const interestAmt = investedAmount * (parseFloat(investmentPackage.interestRate) / 100);
        const intTx = await InvestmentTransaction.create({
          customerId: customerRecord.id,
          customer: customer || customerRecord.fullName || customerRecord.name,
          accountNumber: accountNumber || customerRecord.accountNumber,
          package: packageName,
          amount: interestAmt,
          branch: branchName,
          agent: agentName,
          transactionType: 'interest',
          notes: `% Interests transaction on deposit #${transaction.id}`,
          merchantId,
          status: 'completed',
          transactionDate: transaction.transactionDate
        }, { transaction: dbTransaction });

        // Book double-entry for interest
        await bookDoubleEntry(merchantId, {
          date: transaction.transactionDate || new Date(),
          description: `Interest Accrued on Deposit #${transaction.id}`,
          debitCode: '500300',
          creditCode: '200300',
          amount: interestAmt,
          transaction: dbTransaction
        });
      }
    }

    await dbTransaction.commit();

    res.status(201).json({
      success: true,
      message: 'Investment transaction created successfully',
      transaction
    });"""

# 4. Handle early errors in catch block to rollback transaction if active
target_catch = """  } catch (error) {
    console.error('Error creating investment transaction:', error);"""

replacement_catch = """  } catch (error) {
    if (typeof dbTransaction !== 'undefined' && dbTransaction) {
      try { await dbTransaction.rollback(); } catch(rErr) { console.error('Rollback error:', rErr); }
    }
    console.error('Error creating investment transaction:', error);"""


content_norm = content.replace('\r\n', '\n')
target_init_norm = target_init.replace('\r\n', '\n')
replacement_init_norm = replacement_init.replace('\r\n', '\n')

target_advance_loop_norm = target_advance_loop.replace('\r\n', '\n')
replacement_advance_loop_norm = replacement_advance_loop.replace('\r\n', '\n')

target_default_norm = target_default.replace('\r\n', '\n')
replacement_default_norm = replacement_default.replace('\r\n', '\n')

target_catch_norm = target_catch.replace('\r\n', '\n')
replacement_catch_norm = replacement_catch.replace('\r\n', '\n')

if target_init_norm in content_norm:
    content_norm = content_norm.replace(target_init_norm, replacement_init_norm)
    print("SUCCESS: target_init matched")
else:
    print("ERROR: target_init NOT matched")

if target_advance_loop_norm in content_norm:
    content_norm = content_norm.replace(target_advance_loop_norm, replacement_advance_loop_norm)
    print("SUCCESS: target_advance_loop matched")
else:
    print("ERROR: target_advance_loop NOT matched")

if target_default_norm in content_norm:
    content_norm = content_norm.replace(target_default_norm, replacement_default_norm)
    print("SUCCESS: target_default matched")
else:
    print("ERROR: target_default NOT matched")

if target_catch_norm in content_norm:
    content_norm = content_norm.replace(target_catch_norm, replacement_catch_norm)
    print("SUCCESS: target_catch matched")
else:
    print("ERROR: target_catch NOT matched")

with open(target_file, 'w', encoding='utf-8', newline='') as f:
    f.write(content_norm)
print("Saved investmentController.")
