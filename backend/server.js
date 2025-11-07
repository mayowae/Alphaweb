const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// Configure multer for form-data (including file uploads)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, file.fieldname + '-' + unique + ext);
  }
});
const upload = multer({ storage });

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
const investmentTransactionController = require('./controllers/investmentTransactionController');
const investmentApplicationController = require('./controllers/investmentApplicationController');
const loanApplicationController = require('./controllers/loanApplicationController');
const repaymentController = require('./controllers/repaymentController');
const packageController = require('./controllers/packageController');
const collectionController = require('./controllers/collectionController');
const walletController = require('./controllers/walletController');
const remittanceController = require('./controllers/remittanceController');
const customerWalletController = require('./controllers/customerWalletController');
const dashboardController = require('./controllers/dashboardController');
const superAdminController = require('./controllers/superAdminController');

// Import middleware
const { verifyToken, requireMerchant, requireCollaborator, requireAuthenticated, requireSuperAdmin } = require('./middleware/auth');

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AlphaWeb API',
      version: '1.0.0',
      description: 'API documentation for AlphaWeb investment management system',
      contact: {
        name: 'AlphaWeb Team',
        email: 'support@alphaweb.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        InvestmentApplication: {
          type: 'object',
          required: ['customerName', 'targetAmount', 'duration'],
          properties: {
            id: {
              type: 'integer',
              description: 'Application ID'
            },
            customerName: {
              type: 'string',
              description: 'Customer full name'
            },
            accountNumber: {
              type: 'string',
              description: 'Customer account number'
            },
            targetAmount: {
              type: 'number',
              format: 'float',
              description: 'Target investment amount'
            },
            duration: {
              type: 'integer',
              description: 'Investment duration in days'
            },
            agentId: {
              type: 'integer',
              description: 'Agent ID handling the application'
            },
            agentName: {
              type: 'string',
              description: 'Agent name'
            },
            branch: {
              type: 'string',
              description: 'Branch name'
            },
            status: {
              type: 'string',
              enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
              description: 'Application status'
            },
            notes: {
              type: 'string',
              description: 'Additional notes'
            },
            rejectionReason: {
              type: 'string',
              description: 'Reason for rejection'
            },
            dateApplied: {
              type: 'string',
              format: 'date-time',
              description: 'Date when application was submitted'
            },
            merchantId: {
              type: 'integer',
              description: 'Merchant ID'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            error: {
              type: 'string',
              example: 'Detailed error information'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation successful'
            },
            application: {
              $ref: '#/components/schemas/InvestmentApplication'
            }
          }
        },
        Customer: {
          type: 'object',
          required: ['fullName', 'phoneNumber', 'email', 'agentId', 'branchId', 'merchantId'],
          properties: {
            id: {
              type: 'integer',
              description: 'Customer ID'
            },
            fullName: {
              type: 'string',
              description: 'Customer full name',
              example: 'John Doe'
            },
            phoneNumber: {
              type: 'string',
              description: 'Customer phone number',
              example: '+2348012345678'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Customer email address',
              example: 'john.doe@example.com'
            },
            alias: {
              type: 'string',
              description: 'Customer alias or nickname',
              example: 'Johnny'
            },
            address: {
              type: 'string',
              description: 'Customer address',
              example: '123 Main Street, Lagos, Nigeria'
            },
            accountNumber: {
              type: 'string',
              description: 'Customer account number',
              example: 'ACC123456'
            },
            agentId: {
              type: 'integer',
              description: 'Agent ID assigned to customer'
            },
            branchId: {
              type: 'integer',
              description: 'Branch ID where customer is registered'
            },
            merchantId: {
              type: 'integer',
              description: 'Merchant ID'
            },
            packageId: {
              type: 'integer',
              description: 'Package ID assigned to customer'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Customer creation date'
            },
            agentName: {
              type: 'string',
              description: 'Agent name (populated in responses)',
              example: 'Agent Smith'
            },
            branchName: {
              type: 'string',
              description: 'Branch name (populated in responses)',
              example: 'Main Branch'
            },
            packageName: {
              type: 'string',
              description: 'Package name (populated in responses)',
              example: 'Premium Package'
            },
            status: {
              type: 'string',
              description: 'Customer status',
              example: 'Active'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./server.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'AlphaWeb API Documentation'
}));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Test database connection using shared instance
db.sequelize.authenticate()
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

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Server is running"
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

/**
 * @swagger
 * /merchant/signup:
 *   post:
 *     summary: Register a new merchant
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - businessAlias
 *               - phone
 *               - email
 *               - currency
 *               - password
 *             properties:
 *               businessName:
 *                 type: string
 *                 example: "Alpha Investment Ltd"
 *               businessAlias:
 *                 type: string
 *                 example: "AlphaInv"
 *               phone:
 *                 type: string
 *                 example: "+2348012345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@alphainv.com"
 *               currency:
 *                 type: string
 *                 example: "NGN"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123"
 *     responses:
 *       201:
 *         description: Merchant registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Merchant registered successfully. Please verify your email with the OTP sent."
 *                 merchantId:
 *                   type: integer
 *                   example: 1
 *                 otp:
 *                   type: string
 *                   example: "123456"
 *       400:
 *         description: Bad request - email already exists or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * /merchant/login:
 *   post:
 *     summary: Login merchant
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@alphainv.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 merchant:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     businessName:
 *                       type: string
 *                       example: "Alpha Investment Ltd"
 *                     email:
 *                       type: string
 *                       example: "admin@alphainv.com"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 * /merchant/verify-otp:
 *   post:
 *     summary: Verify OTP for merchant email verification
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@alphainv.com"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email verified successfully"
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Email not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

// Investment Transaction routes
app.post('/investment-transactions', upload.none(), verifyToken, requireAuthenticated, investmentTransactionController.createInvestmentTransaction);
app.get('/investment-transactions', verifyToken, requireAuthenticated, investmentTransactionController.getInvestmentTransactions);
app.get('/investment-transactions/:id', verifyToken, requireAuthenticated, investmentTransactionController.getInvestmentTransactionById);
app.put('/investment-transactions/:id', upload.none(), verifyToken, requireAuthenticated, investmentTransactionController.updateInvestmentTransaction);
app.delete('/investment-transactions/:id', verifyToken, requireAuthenticated, investmentTransactionController.deleteInvestmentTransaction);

/**
 * @swagger
 * /investment-applications:
 *   post:
 *     summary: Create a new investment application
 *     tags: [Investment Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - targetAmount
 *               - duration
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: "John Doe"
 *               accountNumber:
 *                 type: string
 *                 example: "ACC123456"
 *               targetAmount:
 *                 type: number
 *                 format: float
 *                 example: 50000.00
 *               duration:
 *                 type: integer
 *                 example: 365
 *               agentId:
 *                 type: integer
 *                 example: 1
 *               branch:
 *                 type: string
 *                 example: "Main Branch"
 *               notes:
 *                 type: string
 *                 example: "Customer interested in long-term investment"
 *     responses:
 *       201:
 *         description: Investment application created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   get:
 *     summary: Get all investment applications with filtering and pagination
 *     tags: [Investment Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected, Completed]
 *         description: Filter by application status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by customer name, account number, or agent name
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter applications from this date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter applications to this date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of investment applications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 applications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InvestmentApplication'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalItems:
 *                       type: integer
 *                       example: 50
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/investment-applications', upload.none(), verifyToken, requireAuthenticated, investmentApplicationController.createInvestmentApplication);
app.get('/investment-applications', verifyToken, requireAuthenticated, investmentApplicationController.getInvestmentApplications);

/**
 * @swagger
 * /investment-applications/{id}:
 *   get:
 *     summary: Get investment application by ID
 *     tags: [Investment Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Investment application ID
 *     responses:
 *       200:
 *         description: Investment application retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 application:
 *                   $ref: '#/components/schemas/InvestmentApplication'
 *       404:
 *         description: Investment application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete investment application
 *     tags: [Investment Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Investment application ID
 *     responses:
 *       200:
 *         description: Investment application deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Investment application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.get('/investment-applications/:id', verifyToken, requireAuthenticated, investmentApplicationController.getInvestmentApplicationById);
app.delete('/investment-applications/:id', verifyToken, requireAuthenticated, investmentApplicationController.deleteInvestmentApplication);

/**
 * @swagger
 * /investment-applications/{id}/status:
 *   put:
 *     summary: Update investment application status
 *     tags: [Investment Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Investment application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Approved, Rejected, Completed]
 *                 example: "Approved"
 *               notes:
 *                 type: string
 *                 example: "Application approved after review"
 *               rejectionReason:
 *                 type: string
 *                 example: "Insufficient documentation"
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request - invalid status or missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Investment application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.put('/investment-applications/:id/status', upload.none(), verifyToken, requireAuthenticated, investmentApplicationController.updateApplicationStatus);
app.put('/investment-applications/:id', upload.none(), verifyToken, requireAuthenticated, investmentApplicationController.updateInvestmentApplication);

// Loan Application routes
app.post('/loan-applications', upload.none(), verifyToken, requireAuthenticated, loanApplicationController.createLoanApplication);
app.get('/loan-applications', verifyToken, requireAuthenticated, loanApplicationController.getLoanApplications);
app.get('/loan-applications/:id', verifyToken, requireAuthenticated, loanApplicationController.getLoanApplicationById);
app.put('/loan-applications/:id/status', upload.none(), verifyToken, requireAuthenticated, loanApplicationController.updateApplicationStatus);
app.delete('/loan-applications/:id', verifyToken, requireAuthenticated, loanApplicationController.deleteLoanApplication);

// Loan routes
app.post('/loans', upload.single('loanForm'), verifyToken, requireAuthenticated, loanController.createLoan);
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

// Remittance routes
app.post('/remittances', upload.none(), verifyToken, requireAuthenticated, remittanceController.createRemittance);
app.get('/remittances', verifyToken, requireAuthenticated, remittanceController.listRemittances);
app.get('/remittances/:id', verifyToken, requireAuthenticated, remittanceController.getRemittanceById);
app.put('/remittances', upload.none(), verifyToken, requireAuthenticated, remittanceController.updateRemittance);
app.put('/remittances/:id/approve', upload.none(), verifyToken, requireAuthenticated, remittanceController.approveRemittance);
app.delete('/remittances/:id', verifyToken, requireAuthenticated, remittanceController.deleteRemittance);

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








// super Admin routes


/**
 * @swagger
 * /superadmin/login:
 *   post:
 *     summary: Super Admin Login
 *     description: Authenticate a Super Admin using email and password. Returns a JWT token on success.
 *     tags: [SuperAdmins]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: superadmin@airpero.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SuperAdmin@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 token:
 *                   type: string
 *                   description: JWT access token
 *                 superAdmin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "uuid-string-or-integer-id"
 *                     name:
 *                       type: string
 *                       example: System Admin
 *                     email:
 *                       type: string
 *                       example: superadmin@airpero.com
 *                     role:
 *                       type: string
 *                       example: superAdmin
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       422:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: email is required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login failed
 *                 error:
 *                   type: string
*/
app.post('/superadmin/login', superAdminController.loginSuperAdmin);
/**
 * @swagger
 * /superadmin/superStats:
 *   get:
 *     summary: Get Super Admin Statistics
 *     description: Fetch overall statistics for merchants (total, active, inactive).
 *     tags: [SuperAdmins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalMerchants:
 *                       type: integer
 *                       example: 100
 *                     activeMerchants:
 *                       type: integer
 *                       example: 75
 *                     inactiveMerchants:
 *                       type: integer
 *                       example: 25
 *       500:
 *         description: Failed to fetch statistics
 */
app.get('/superadmin/superStats', verifyToken, requireSuperAdmin, superAdminController.getSuperAdminStats);
/**
 * @swagger
 * /superadmin/merchantStats:
 *   get:
 *     summary: Get Merchant Statistics
 *     description: Fetch merchant registration stats over a given duration (3, 6, or 12 months).
 *     tags:
 *       - SuperAdmins
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: duration
 *         schema:
 *           type: string
 *           enum: [Last 3 months, Last 6 months, Last 12 months]
 *         required: true
 *         description: Time duration for stats
 *     responses:
 *       200:
 *         description: Merchant stats fetched successfully
 *       422:
 *         description: Invalid duration
 *       500:
 *         description: Failed to fetch statistics
*/
app.get('/superadmin/merchantStats', verifyToken, requireSuperAdmin, superAdminController.getMerchantStats);
/**
 * @swagger
 * /superadmin/allActivities:
 *   get:
 *     summary: Get All Activities
 *     description: Fetch activity logs of merchants, agents, and staff.
 *     tags:
 *       - SuperAdmins
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Activities fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Activities fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "12345"
 *                       actor:
 *                         type: string
 *                         example: "Merchant John Doe"
 *                       action:
 *                         type: string
 *                         example: "Approved withdrawal request"
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-27T14:30:00Z"
 *       500:
 *         description: Failed to fetch activities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to fetch activities
 *                 error:
 *                   type: string
 *                   example: Database connection error
*/
app.get('/superadmin/allActivities', verifyToken, requireSuperAdmin, superAdminController.getAllActivities);
/**
 * @swagger
 * /superadmin/allMerchants:
 *   get:
 *     summary: Get All Merchants
 *     description: Retrieve all merchants in the system.
 *     tags:
 *       - Merchants
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Merchants fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Merchants fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "uuid-string"
 *                       businessName:
 *                         type: string
 *                         example: "Airpero Limited"
 *                       email:
 *                         type: string
 *                         example: "info@airpero.com"
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-27T12:00:00Z"
 *       500:
 *         description: Failed to fetch merchants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to fetch merchants
 *                 error:
 *                   type: string
 *                   example: Database connection error
*/
app.get('/superadmin/allMerchants', verifyToken, requireSuperAdmin, superAdminController.getAllMerchants);
/**
 * @swagger
 * /superadmin/allTransactions:
 *   get:
 *     summary: Get All Transactions
 *     description: Retrieve all transactions along with merchant details.
 *     tags:
 *       - Transactions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transactions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Transactions fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       transactionId:
 *                         type: string
 *                         example: "TRX-123456"
 *                       merchantName:
 *                         type: string
 *                         example: "Airpero Limited"
 *                       amount:
 *                         type: number
 *                         example: 25000
 *                       currency:
 *                         type: string
 *                         example: "NGN"
 *                       status:
 *                         type: string
 *                         example: "completed"
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-27T10:15:00Z"
 *       500:
 *         description: Failed to fetch transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to fetch transactions
 *                 error:
 *                   type: string
 *                   example: Internal server error
*/
app.get('/superadmin/allTransactions', verifyToken, requireSuperAdmin, superAdminController.getAllTransactions);
/**
 * @swagger
 * /superadmin/createPlan:
 *   post:
 *     summary: Create a Subscription Plan
 *     description: Super Admin can create a new subscription plan.
 *     tags:
 *       - Plans
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - name
 *               - billing_cycle
 *               - pricing
 *             properties:
 *               type:
 *                 type: string
 *                 example: premium
 *               name:
 *                 type: string
 *                 example: Gold Plan
 *               billing_cycle:
 *                 type: string
 *                 example: monthly
 *               pricing:
 *                 type: number
 *                 example: 5000
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-01-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *               merchant:
 *                 type: integer
 *                 example: 1
 *               no_of_branches:
 *                 type: integer
 *                 example: 10
 *               no_of_customers:
 *                 type: integer
 *                 example: 1000
 *               no_of_agents:
 *                 type: integer
 *                 example: 50
 *     responses:
 *       201:
 *         description: Plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Plan created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "plan-uuid"
 *                     name:
 *                       type: string
 *                       example: Gold Plan
 *                     pricing:
 *                       type: number
 *                       example: 5000
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Validation error - missing required field
 *       500:
 *         description: Failed to create plan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Failed to create plan
 *                 error:
 *                   type: string
 *                   example: Internal server error
*/
app.post('/superadmin/createPlan', verifyToken, requireSuperAdmin, superAdminController.createPlan);
/**
 * @swagger
 * /superadmin/getAllPlans:
 *   get:
 *     summary: Get All Plans
 *     description: Retrieve all subscription plans (optionally filtered by type).
 *     tags:
 *       - Plans
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter by plan type
 *     responses:
 *       200:
 *         description: Plans fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "plan-uuid"
 *                       name:
 *                         type: string
 *                         example: Gold Plan
 *                       type:
 *                         type: string
 *                         example: premium
 *                       pricing:
 *                         type: number
 *                         example: 5000
 *       500:
 *         description: Failed to fetch plans
*/
app.get('/superadmin/getAllPlans', verifyToken, requireSuperAdmin, superAdminController.getAllPlans);
/**
 * @swagger
 * /superadmin/createRole:
 *   post:
 *     summary: Create a Role
 *     description: Create a new role with specific permissions.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Manager
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["CREATE_USER", "DELETE_USER"]
 *     responses:
 *       201:
 *         description: Role created successfully
 *       422:
 *         description: Validation error
 *       500:
 *         description: Failed to create role
*/
app.post('/superadmin/createRole', verifyToken, requireSuperAdmin, superAdminController.createRole);
/**
 * @swagger
 * /superadmin/getAllPermissions:
 *   get:
 *     summary: Get All Permissions
 *     description: Fetch the list of available permissions.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["CREATE_USER", "VIEW_REPORTS", "DELETE_USER"]
*/
app.get('/superadmin/getAllPermissions', verifyToken, requireSuperAdmin, superAdminController.getAllPermissions);
/**
 * @swagger
 * /superadmin/getAllRoles:
 *   get:
 *     summary: Get All Roles
 *     description: Fetch all roles with their permissions.
 *     tags:
 *       - Roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *                       name:
 *                         type: string
 *                         example: Manager
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["CREATE_USER", "DELETE_USER"]
 *       500:
 *         description: Failed to fetch roles
*/
app.get('/superadmin/getAllRoles', verifyToken, requireSuperAdmin, superAdminController.getAllRoles);

/**
 * @swagger
 * /superadmin/createAdminStaff:
 *   post:
 *     summary: Create Admin Staff
 *     description: Add a new staff member under the super admin.
 *     tags:
 *       - AdminStaff
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phoneNumber
 *               - password
 *               - roleId
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               phoneNumber:
 *                 type: string
 *                 example: "+2348012345678"
 *               password:
 *                 type: string
 *                 example: Password123!
 *               roleId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Admin staff created successfully
 *       422:
 *         description: Validation error
 *       500:
 *         description: Failed to create admin staff
*/
app.post('/superadmin/createAdminStaff', verifyToken, requireSuperAdmin, superAdminController.createAdminStaff);
/**
 * @swagger
 * /superadmin/getAllAdminStaff:
 *   get:
 *     summary: Get All Admin Staff
 *     description: Fetch all admin staff with their assigned roles.
 *     tags:
 *       - AdminStaff
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin staff fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         example: john@example.com
 *                       role:
 *                         type: string
 *                         example: Manager
 *       500:
 *         description: Failed to fetch admin staff
*/
app.get('/superadmin/getAllAdminStaff', verifyToken, requireSuperAdmin, superAdminController.getAllAdminStaff);
/**
 * @swagger
 * /superadmin/logs:
 *   get:
 *     summary: Get All Admin Logs
 *     description: Fetch all logs of admin staff actions.
 *     tags:
 *       - AdminLogs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin logs fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       staffId:
 *                         type: integer
 *                         example: 3
 *                       action:
 *                         type: string
 *                         example: Created new merchant
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-10-27T13:45:00Z"
 *       500:
 *         description: Failed to fetch admin logs
*/
app.get('/superAdmin/logs', verifyToken, requireSuperAdmin, superAdminController.getAllAdminLogs);
/**
 * @swagger
 * /superadmin/logs/{staffId}:
 *   get:
 *     summary: Get Admin Logs by Staff
 *     description: Fetch logs for a specific admin staff by their ID.
 *     tags:
 *       - AdminLogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: staffId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the staff
 *     responses:
 *       200:
 *         description: Logs fetched successfully
 *       422:
 *         description: staffId is required
 *       500:
 *         description: Failed to fetch logs
*/
app.get('/superAdmin/logs/:staffId', verifyToken, requireSuperAdmin, superAdminController.getAdminLogsByStaff);

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
