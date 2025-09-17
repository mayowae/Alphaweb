const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const { Sequelize } = require('sequelize');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
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
const PORT = process.env.PORT || 3000;

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
app.post('/investment-applications', upload.none(), investmentApplicationController.createInvestmentApplication);
app.get('/investment-applications', investmentApplicationController.getInvestmentApplications);

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
