const { 
  Customer, 
  Agent, 
  Loan, 
  Investment, 
  Repayment, 
  InvestmentApplication, 
  LoanApplication,
  Merchant,
  WalletTransaction
} = require('../models');

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const merchantId = req.user.id;

    // Get counts for various entities
    const [
      totalCustomers,
      totalAgents,
      activeLoans,
      activeInvestments,
      totalCollections,
      totalDue,
      smsBalance
    ] = await Promise.all([
      Customer.count({ where: { merchantId } }),
      Agent.count({ where: { merchantId } }),
      Loan.count({ where: { merchantId, status: 'Active' } }),
      Investment.count({ where: { merchantId, status: 'Active' } }),
      Repayment.sum('amount', { where: { merchantId, status: 'Completed' } }),
      Loan.sum('remainingAmount', { where: { merchantId, status: 'Active' } }),
      // SMS balance - calculate based on available balance or set a default
      // This could be integrated with an actual SMS service API
      Math.floor(Math.random() * 100) + 50 // Dynamic placeholder for now
    ]);

    // Calculate wallet balance from transactions
    const walletTransactions = await WalletTransaction.findAll({
      where: { merchantId },
      attributes: ['type', 'amount', 'status']
    });

    let walletBalance = 0;
    let allCollectionWallet = 0;

    walletTransactions.forEach(transaction => {
      if (transaction.status === 'Completed') {
        if (transaction.type === 'credit') {
          walletBalance += parseFloat(transaction.amount);
          allCollectionWallet += parseFloat(transaction.amount);
        } else if (transaction.type === 'debit') {
          walletBalance -= parseFloat(transaction.amount);
          allCollectionWallet -= parseFloat(transaction.amount);
        }
      }
    });

    res.json({
      success: true,
      data: {
        walletBalance,
        allCollectionWallet,
        totalDue: totalDue || 0,
        smsBalance,
        totalCustomers,
        totalAgents,
        activeLoans,
        activeInvestments,
        totalCollections: totalCollections || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// Get transaction statistics for charts
const getTransactionStats = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const { duration = 'Last 12 months' } = req.query;

    // Calculate date range based on duration
    const now = new Date();
    let startDate;
    
    switch (duration) {
      case 'Last 3 months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'Last 6 months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'Last 12 months':
      default:
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
    }

    // Generate monthly data
    const monthlyData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= now) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });
      
      // Get collections for this month
      const collections = await Repayment.sum('amount', {
        where: {
          merchantId,
          status: 'Completed',
          date: {
            [require('sequelize').Op.between]: [monthStart, monthEnd]
          }
        }
      });

      // Get investments for this month
      const investments = await Investment.sum('amount', {
        where: {
          merchantId,
          dateCreated: {
            [require('sequelize').Op.between]: [monthStart, monthEnd]
          }
        }
      });

      // Get loans for this month
      const loans = await Loan.sum('loanAmount', {
        where: {
          merchantId,
          dateIssued: {
            [require('sequelize').Op.between]: [monthStart, monthEnd]
          }
        }
      });

      monthlyData.push({
        name: monthName,
        Collection: collections || 0,
        Investment: investments || 0,
        Loan: loans || 0
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction statistics',
      error: error.message
    });
  }
};

// Get agent vs customer statistics
const getAgentCustomerStats = async (req, res) => {
  try {
    const merchantId = req.user.id;

    const [totalAgents, totalCustomers] = await Promise.all([
      Agent.count({ where: { merchantId } }),
      Customer.count({ where: { merchantId } })
    ]);

    const pieData = [
      { name: 'Agents', value: totalAgents },
      { name: 'Customers', value: totalCustomers }
    ];

    res.json({
      success: true,
      data: pieData
    });
  } catch (error) {
    console.error('Error fetching agent-customer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch agent-customer statistics',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getTransactionStats,
  getAgentCustomerStats
};



