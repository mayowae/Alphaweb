/**
 * Transaction Mapping Configuration
 * 
 * Maps system transaction types to their double-entry accounting rules.
 * Uses the existing account codes from the seeded Chart of Accounts.
 * 
 * Account Code Reference:
 *   100300 = Bank (Cash at Bank)
 *   100400 = Cash
 *   200100 = Customer Collection - Savings (Customer Wallet Deposits)
 *   200300 = Customer Collection - Investment (Customer Investments Held)
 *   200500 = Customer Loans (Loans Receivable)
 *   400200 = Charges - Collection (Transaction Fee Income)
 *   400600 = Interest Loan (Loan Interest Income)
 *   500300 = Interest Fixed Deposit (Investment Interest Expense)
 *   200550 = Loan Repayment (Remittance Clearing)
 */

const { bookDoubleEntry } = require('./doubleEntry');

/**
 * TRANSACTION_MAPPING:
 * Each key maps to { debitCode, creditCode, description }
 * 
 * Mapping from the Transaction Mapping Configuration Table:
 * ┌─────────────────────────────┬──────────┬──────────┐
 * │ Transaction Type            │ Dr       │ Cr       │
 * ├─────────────────────────────┼──────────┼──────────┤
 * │ Wallet Funding (Deposit)    │ 100300   │ 200100   │
 * │ Wallet Withdrawal           │ 200100   │ 100300   │
 * │ Transaction Fees (Charges)  │ 200100   │ 400200   │
 * │ Loan Disbursement           │ 200500   │ 200100   │
 * │ Loan Repayment (Principal)  │ 200100   │ 200500   │
 * │ Loan Interest Repayment     │ 200100   │ 400600   │
 * │ Investment Deposit           │ 200100   │ 200300   │
 * │ Investment Returns (Payout) │ 500300   │ 200100   │
 * │ Investment Withdrawal       │ 200300   │ 200100   │
 * │ Remittance Created (Sent)   │ 200100   │ 200550   │
 * │ Remittance Payout (Rec.)    │ 200550   │ 100300   │
 * │ Collection Received         │ 100400   │ 200100   │
 * └─────────────────────────────┴──────────┴──────────┘
 */
const TRANSACTION_MAPPING = {
  WALLET_DEPOSIT: {
    debitCode: '100300',
    creditCode: '200100',
    label: 'Wallet Funding (Deposit)'
  },
  WALLET_WITHDRAWAL: {
    debitCode: '200100',
    creditCode: '100300',
    label: 'Wallet Withdrawal'
  },
  TRANSACTION_FEE: {
    debitCode: '200100',
    creditCode: '400200',
    label: 'Transaction Fee'
  },
  LOAN_DISBURSEMENT: {
    debitCode: '200500',
    creditCode: '200100',
    label: 'Loan Disbursement'
  },
  LOAN_REPAYMENT_PRINCIPAL: {
    debitCode: '200100',
    creditCode: '200500',
    label: 'Loan Repayment (Principal)'
  },
  LOAN_INTEREST_REPAYMENT: {
    debitCode: '200100',
    creditCode: '400600',
    label: 'Loan Interest Repayment'
  },
  INVESTMENT_DEPOSIT: {
    debitCode: '200100',
    creditCode: '200300',
    label: 'Investment Deposit'
  },
  INVESTMENT_RETURNS: {
    debitCode: '500300',
    creditCode: '200100',
    label: 'Investment Returns (Payout)'
  },
  INVESTMENT_WITHDRAWAL: {
    debitCode: '200300',
    creditCode: '200100',
    label: 'Investment Withdrawal (Principal)'
  },
  REMITTANCE_SENT: {
    debitCode: '200100',
    creditCode: '200550',
    label: 'Remittance Created (Sent)'
  },
  REMITTANCE_RECEIVED: {
    debitCode: '200550',
    creditCode: '100300',
    label: 'Remittance Payout (Received)'
  },
  COLLECTION_RECEIVED: {
    debitCode: '100400',
    creditCode: '200100',
    label: 'Collection Received (Savings)'
  }
};

/**
 * Post a journal entry for a system transaction.
 * This is NON-BLOCKING — if it fails, it logs a warning but does NOT
 * interrupt the main transaction flow.
 *
 * @param {string} txType     - One of the TRANSACTION_MAPPING keys
 * @param {number} amount     - Transaction amount
 * @param {number} merchantId - Merchant ID
 * @param {string} refDesc    - Optional reference description (e.g. "Loan #12")
 * @param {object} [dbTransaction=null] - Optional Sequelize transaction object
 * @returns {Promise<void>}
 */
const postJournalForTransaction = async (txType, amount, merchantId, refDesc = '', dbTransaction = null) => {
  const mapping = TRANSACTION_MAPPING[txType];
  if (!mapping) {
    console.warn(`⚠️ No transaction mapping found for type: ${txType}`);
    return;
  }

  const description = refDesc
    ? `${mapping.label} — ${refDesc}`
    : mapping.label;

  try {
    await bookDoubleEntry(merchantId, {
      date: new Date(),
      description,
      debitCode: mapping.debitCode,
      creditCode: mapping.creditCode,
      amount,
      transaction: dbTransaction
    });
  } catch (err) {
    // Non-blocking: warn but don't crash the calling controller
    console.warn(`⚠️ Journal entry skipped for [${txType}]: ${err.message}`);
  }
};

/**
 * Post a reversal journal entry when a transaction is deleted.
 * Swaps debit and credit accounts to reverse the original transaction's accounting effect.
 *
 * @param {string} txType     - One of the TRANSACTION_MAPPING keys
 * @param {number} amount     - Transaction amount
 * @param {number} merchantId - Merchant ID
 * @param {string} refDesc    - Optional reference description containing original transaction audit details
 * @param {object} [dbTransaction=null] - Optional Sequelize transaction object
 * @returns {Promise<void>}
 */
const postReversalForTransaction = async (txType, amount, merchantId, refDesc = '', dbTransaction = null) => {
  const mapping = TRANSACTION_MAPPING[txType];
  if (!mapping) {
    console.warn(`⚠️ No transaction mapping found for type: ${txType}`);
    return;
  }

  const description = `REVERSAL (DELETED) — ${mapping.label}${refDesc ? ` — ${refDesc}` : ''}`;

  try {
    // Swap debitCode and creditCode to book the reversal
    await bookDoubleEntry(merchantId, {
      date: new Date(),
      description,
      debitCode: mapping.creditCode,
      creditCode: mapping.debitCode,
      amount,
      transaction: dbTransaction
    });
  } catch (err) {
    console.warn(`⚠️ Reversal journal entry skipped for [${txType}]: ${err.message}`);
  }
};

module.exports = {
  postJournalForTransaction,
  postReversalForTransaction,
  TRANSACTION_MAPPING
};
