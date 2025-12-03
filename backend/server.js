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
