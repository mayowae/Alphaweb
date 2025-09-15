const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configure multer for form-data
const upload = multer();

// Import models and database
const db = require('./models');

// Import controllers
const authController = require('./controllers/authController');
const collaboratorController = require('./controllers/collaboratorController');
const userController = require('./controllers/userController');
const transactionController = require('./controllers/transactionController');
const summaryController = require('./controllers/summaryController');
const agentController = require('./controllers/agentController');
const branchController = require('./controllers/branchController');
const customerController = require('./controllers/customerController');
const roleController = require('./controllers/roleController');
const staffController = require('./controllers/staffController');
const chargeController = require('./controllers/chargeController');
const loanController = require('./controllers/loanController');
const investmentController = require('./controllers/investmentController');
const investmentApplicationController = require('./controllers/investmentApplicationController');
const loanApplicationController = require('./controllers/loanApplicationController');
const repaymentController = require('./controllers/repaymentController');
const packageController = require('./controllers/packageController');
const collectionController = require('./controllers/collectionController');
const walletController = require('./controllers/walletController');
const customerWalletController = require('./controllers/customerWalletController');
const dashboardController = require('./controllers/dashboardController');

// Import middleware
const { verifyToken, requireMerchant, requireCollaborator, requireAuthenticated } = require('./middleware/auth');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const sequelize = new Sequelize('alphacollect_db', 'root', 'UJYmFcc5WNXZRmfApWfswlVUmtWYFnfW', {
  host: 'dpg-d2phh3mr433s73dakm90-a.oregon-postgres.render.com',
  port: 5432,
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true, // Render requires SSL
      rejectUnauthorized: false
    }
  }
});

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Sync database - disabled to avoid column name conflicts
// db.sequelize.sync({ force: false })
//   .then(() => {
//     console.log('Database synchronized successfully.');
//   })
//   .catch(err => {
//     console.error('Error synchronizing database:', err);
//   });

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Merchant authentication routes
app.post('/merchant/signup', authController.registerMerchant);
app.post('/merchant/login', authController.loginMerchant);
app.post('/merchant/forgot-password', authController.forgotPassword);
app.post('/merchant/resend-otp', authController.resendOTP);
app.post('/merchant/verify-otp', authController.verifyOTP);
app.post('/merchant/change-password', authController.changePassword);

// Collaborator authentication routes
app.post('/collaborator/signup', collaboratorController.registerCollaborator);
app.post('/collaborator/login', collaboratorController.loginCollaborator);
app.post('/collaborator/forgot-password', collaboratorController.collaboratorForgotPassword);
app.post('/collaborator/resend-otp', collaboratorController.collaboratorResendOTP);
app.post('/collaborator/verify-otp', collaboratorController.collaboratorVerifyOTP);
app.post('/collaborator/change-password', collaboratorController.collaboratorChangePassword);

// User authentication routes (for mobile app)
app.post('/api/auth/register', userController.registerUser);
app.post('/api/auth/login', userController.loginUser);
app.post('/api/auth/forgot-password', userController.forgotPassword);
app.post('/api/auth/verify-otp', userController.verifyOTP);
app.post('/api/auth/change-password', userController.changePassword);

// Protected user routes
app.get('/api/user/profile', verifyToken, userController.getUserProfile);
app.put('/api/user/device-token', verifyToken, userController.updateDeviceToken);

// Transaction routes
app.get('/api/transactions', verifyToken, transactionController.getUserTransactions);
app.get('/api/transactions/:id', verifyToken, transactionController.getTransactionById);
app.post('/api/transactions', verifyToken, transactionController.createTransaction);

// Summary routes
app.get('/api/summary', verifyToken, summaryController.getUserSummary);
app.get('/api/user/stats', verifyToken, summaryController.getUserStats);

// Protected routes (require authentication)

// Agent routes
app.post('/agents', upload.none(), verifyToken, requireAuthenticated, agentController.registerAgent);
app.put('/agents', upload.none(), verifyToken, requireAuthenticated, agentController.updateAgent);
app.get('/agents', verifyToken, requireAuthenticated, agentController.listAgents);
app.get('/agents/:id', verifyToken, requireAuthenticated, agentController.getAgentById);
app.patch('/agents/:id/status', upload.none(), verifyToken, requireAuthenticated, agentController.updateAgentStatus);

// Branch routes
app.post('/branches', upload.none(), verifyToken, requireAuthenticated, branchController.createBranch);
app.put('/branches', upload.none(), verifyToken, requireAuthenticated, branchController.updateBranch);
app.get('/branches', verifyToken, requireAuthenticated, branchController.listBranches);
app.get('/branches/:id', verifyToken, requireAuthenticated, branchController.getBranchById);
app.delete('/branches/:id', verifyToken, requireAuthenticated, branchController.deleteBranch);

// Customer routes
app.post('/customers', upload.none(), verifyToken, requireAuthenticated, customerController.createCustomer);
app.get('/customers', verifyToken, requireAuthenticated, customerController.listCustomers);
app.get('/customers/:id', verifyToken, requireAuthenticated, customerController.getCustomerById);
app.put('/customers', upload.none(), verifyToken, requireAuthenticated, customerController.updateCustomer);

// Role routes
app.post('/roles', upload.none(), verifyToken, requireAuthenticated, roleController.createRole);
app.put('/roles', upload.none(), verifyToken, requireAuthenticated, roleController.updateRole);
app.get('/roles', verifyToken, requireAuthenticated, roleController.listRoles);
app.get('/roles/:id', verifyToken, requireAuthenticated, roleController.getRoleById);

// Staff routes
app.post('/staff', upload.none(), verifyToken, requireAuthenticated, staffController.createStaff);
app.put('/staff', upload.none(), verifyToken, requireAuthenticated, staffController.updateStaff);
app.get('/staff', verifyToken, requireAuthenticated, staffController.listStaff);
app.get('/staff/:id', verifyToken, requireAuthenticated, staffController.getStaffById);

// Charge routes
app.post('/charges', upload.none(), verifyToken, requireAuthenticated, chargeController.createCharge);
app.get('/charges', verifyToken, requireAuthenticated, chargeController.getCharges);
app.put('/charges', upload.none(), verifyToken, requireAuthenticated, chargeController.updateCharge);
app.delete('/charges/:id', verifyToken, requireAuthenticated, chargeController.deleteCharge);
app.post('/charges/assign', upload.none(), verifyToken, requireAuthenticated, chargeController.assignCharge);
app.get('/charges/history', verifyToken, requireAuthenticated, chargeController.getChargeHistory);
app.put('/charges/assignments/status', upload.none(), verifyToken, requireAuthenticated, chargeController.updateChargeAssignmentStatus);

// Investment routes
app.post('/investments', upload.none(), verifyToken, requireAuthenticated, investmentController.createInvestment);
app.get('/investments', verifyToken, requireAuthenticated, investmentController.getInvestments);
app.get('/investments/:id', verifyToken, requireAuthenticated, investmentController.getInvestmentById);
// app.put('/investments', upload.none(), verifyToken, requireAuthenticated, investmentController.updateInvestment);
app.delete('/investments/:id', verifyToken, requireAuthenticated, investmentController.deleteInvestment);

// Investment Application routes
app.post('/investment-applications', upload.none(), verifyToken, requireAuthenticated, investmentApplicationController.createInvestmentApplication);
app.get('/investment-applications', verifyToken, requireAuthenticated, investmentApplicationController.getInvestmentApplications);
app.get('/investment-applications/:id', verifyToken, requireAuthenticated, investmentApplicationController.getInvestmentApplicationById);
app.put('/investment-applications/:id/status', upload.none(), verifyToken, requireAuthenticated, investmentApplicationController.updateApplicationStatus);
app.delete('/investment-applications/:id', verifyToken, requireAuthenticated, investmentApplicationController.deleteInvestmentApplication);

// Loan Application routes
app.post('/loan-applications', upload.none(), verifyToken, requireAuthenticated, loanApplicationController.createLoanApplication);
app.get('/loan-applications', verifyToken, requireAuthenticated, loanApplicationController.getLoanApplications);
app.get('/loan-applications/:id', verifyToken, requireAuthenticated, loanApplicationController.getLoanApplicationById);
app.put('/loan-applications/:id/status', upload.none(), verifyToken, requireAuthenticated, loanApplicationController.updateApplicationStatus);
app.delete('/loan-applications/:id', verifyToken, requireAuthenticated, loanApplicationController.deleteLoanApplication);

// Loan routes
app.post('/loans', upload.none(), verifyToken, requireAuthenticated, loanController.createLoan);
app.get('/loans', verifyToken, requireAuthenticated, loanController.getLoans);
app.get('/loans/:id', verifyToken, requireAuthenticated, loanController.getLoanById);
app.put('/loans/:id/status', upload.none(), verifyToken, requireAuthenticated, loanController.updateLoanStatus);
app.delete('/loans/:id', verifyToken, requireAuthenticated, loanController.deleteLoan);
app.get('/loans/stats/summary', verifyToken, requireAuthenticated, loanController.getLoanStats);

// Repayment routes
app.post('/repayments', upload.none(), verifyToken, requireAuthenticated, repaymentController.createRepayment);
app.get('/repayments', verifyToken, requireAuthenticated, repaymentController.getRepayments);
app.get('/repayments/:id', verifyToken, requireAuthenticated, repaymentController.getRepaymentById);
app.put('/repayments/:id/status', upload.none(), verifyToken, requireAuthenticated, repaymentController.updateRepaymentStatus);
app.delete('/repayments/:id', verifyToken, requireAuthenticated, repaymentController.deleteRepayment);
app.get('/repayments/stats/summary', verifyToken, requireAuthenticated, repaymentController.getRepaymentStats);

// Package routes
app.post('/packages', upload.none(), verifyToken, requireAuthenticated, packageController.createPackage);
app.get('/packages', verifyToken, requireAuthenticated, packageController.getPackages);
app.get('/packages/active', verifyToken, requireAuthenticated, packageController.getActivePackages);
app.get('/packages/:id', verifyToken, requireAuthenticated, packageController.getPackageById);
app.put('/packages', upload.none(), verifyToken, requireAuthenticated, packageController.updatePackage);
app.delete('/packages/:id', verifyToken, requireAuthenticated, packageController.deletePackage);

// Collection routes
app.post('/collections', upload.none(), verifyToken, requireAuthenticated, collectionController.createCollection);
app.get('/collections', verifyToken, requireAuthenticated, collectionController.getCollections);
app.get('/collections/:id', verifyToken, requireAuthenticated, collectionController.getCollectionById);
app.put('/collections', upload.none(), verifyToken, requireAuthenticated, collectionController.updateCollection);
app.put('/collections/:id/collect', upload.none(), verifyToken, requireAuthenticated, collectionController.markAsCollected);
app.delete('/collections/:id', verifyToken, requireAuthenticated, collectionController.deleteCollection);
app.get('/collections/status/:status', verifyToken, requireAuthenticated, collectionController.getCollectionsByStatus);
app.get('/collections/overdue', verifyToken, requireAuthenticated, collectionController.getOverdueCollections);

// Wallet routes
app.get('/wallet/balance', verifyToken, requireAuthenticated, walletController.getWalletBalance);
app.post('/wallet/transactions', upload.none(), verifyToken, requireAuthenticated, walletController.createWalletTransaction);
app.get('/wallet/transactions', verifyToken, requireAuthenticated, walletController.getWalletTransactions);
app.get('/wallet/transactions/:id', verifyToken, requireAuthenticated, walletController.getWalletTransactionById);
app.put('/wallet/transactions/:id/status', upload.none(), verifyToken, requireAuthenticated, walletController.updateTransactionStatus);
app.get('/wallet/stats', verifyToken, requireAuthenticated, walletController.getWalletStats);
app.post('/wallet/transfer', upload.none(), verifyToken, requireAuthenticated, walletController.transferToCustomer);

// Customer Wallet routes
app.get('/customer-wallets', verifyToken, requireAuthenticated, customerWalletController.getCustomerWallets);
app.get('/customer-wallets/:id', verifyToken, requireAuthenticated, customerWalletController.getCustomerWalletById);
app.post('/customer-wallets', upload.none(), verifyToken, requireAuthenticated, customerWalletController.createCustomerWallet);
app.put('/customer-wallets/:id', upload.none(), verifyToken, requireAuthenticated, customerWalletController.updateCustomerWallet);
app.delete('/customer-wallets/:id', verifyToken, requireAuthenticated, customerWalletController.deleteCustomerWallet);
app.get('/customer-wallets/stats/summary', verifyToken, requireAuthenticated, customerWalletController.getCustomerWalletStats);

// Dashboard routes
app.get('/dashboard/stats', verifyToken, requireAuthenticated, dashboardController.getDashboardStats);
app.get('/dashboard/transaction-stats', verifyToken, requireAuthenticated, dashboardController.getTransactionStats);
app.get('/dashboard/agent-customer-stats', verifyToken, requireAuthenticated, dashboardController.getAgentCustomerStats);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Alphaweb Backend API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
