const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { SuperAdmin, Merchant, Transaction, Plan } = require('../models');
const { Op } = require("sequelize");
const PERMISSIONS = require('../utils/permissions');
const AdminLogService = require('../services/adminLogService');

// ====================
// Super Admin Login
// ====================
const loginSuperAdmin = async (req, res) => {
  try {
    console.log('SuperAdmin:', SuperAdmin);

    const requiredFields = ["email", "password"];

    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(422).json({ message: `${field} is required` });
      }
    }

    const { email, password } = req.body;

    // Find super admin
    const superAdmin = await SuperAdmin.findOne({ where: { email } });
    if (!superAdmin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, superAdmin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: superAdmin.id, email: superAdmin.email, role: superAdmin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      superAdmin: {
        id: superAdmin.id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.roles,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Get SuperAdmin dashboard stats
const getSuperAdminStats = async (req, res) => {
  try {
    // Count merchants
    const [totalMerchants, activeMerchants, inactiveMerchants] = await Promise.all([
      Merchant.count(),
      Merchant.count({ where: { status: 'active' } }),
      Merchant.count({ where: { status: 'inactive' } })
    ]);

    res.json({
      success: true,
      data: {
        totalMerchants,
        activeMerchants,
        inactiveMerchants
      }
    });
  } catch (error) {
    console.error('Error fetching superAdmin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch superAdmin statistics',
      error: error.message
    });
  }
};

const getMerchantStats = async (req, res) => {
  try {
    const ALLOWED_DURATIONS = ['Last 3 months', 'Last 6 months', 'Last 12 months'];

    if (!ALLOWED_DURATIONS.includes(req.query.duration)) {
      return res.status(422).json({
        message: `Invalid duration. Allowed values are: ${ALLOWED_DURATIONS.join(', ')}`
      });
    }


    const { duration = 'Last 12 months' } = req.query;
    const now = new Date();
    let startDate;

    // Select time range
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

    const monthlyData = [];
    const currentDate = new Date(startDate);

    while (currentDate <= now) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });

      // Merchants registered this month
      const total = await Merchant.count({
        where: {
          createdAt: { [Op.between]: [monthStart, monthEnd] }
        }
      });

      const active = await Merchant.count({
        where: {
          status: 'Active',
          createdAt: { [Op.between]: [monthStart, monthEnd] }
        }
      });

      const inactive = await Merchant.count({
        where: {
          status: 'Inactive',
          createdAt: { [Op.between]: [monthStart, monthEnd] }
        }
      });

      monthlyData.push({
        name: monthName,
        Total: total,
        Active: active,
        Inactive: inactive
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.json({
      success: true,
      data: monthlyData
    });
  } catch (error) {
    console.error('Error fetching merchant stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch merchant statistics',
      error: error.message
    });
  }
};

const getAllActivities = async (req, res) => {
  try {
    // Dummy lookups (simulate fetching names from DB)
    const merchants = {
      101: 'ABC Stores',
      102: 'XYZ Limited'
    };

    const agents = {
      201: 'John Doe (Agent)',
      202: 'Jane Smith (Agent)'
    };

    const staff = {
      301: 'Michael Johnson (Staff)',
      302: 'Emily Brown (Staff)'
    };

    // Dummy activities
    const activities = [
      {
        id: 1,
        person: 'merchant',
        personId: 101,
        action: 'Created new order',
        details: 'Merchant created order #ORD1234',
        date: new Date().toISOString(),
      },
      {
        id: 2,
        person: 'agent',
        personId: 202,
        action: 'Approved transaction',
        details: 'Agent approved withdrawal of ₦50,000',
        date: new Date().toISOString(),
      },
      {
        id: 3,
        person: 'staff',
        personId: 301,
        action: 'Updated profile',
        details: 'Staff updated KYC details',
        date: new Date().toISOString(),
      },
    ];

    // Enrich activities with names (simulate DB join)
    const enrichedActivities = activities.map((activity) => {
      let personName = 'Unknown';

      switch (activity.person) {
        case 'merchant':
          personName = merchants[activity.personId] || 'Unknown Merchant';
          break;
        case 'agent':
          personName = agents[activity.personId] || 'Unknown Agent';
          break;
        case 'staff':
          personName = staff[activity.personId] || 'Unknown Staff';
          break;
      }

      return {
        ...activity,
        personName,
      };
    });

    res.json({
      success: true,
      data: enrichedActivities,
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message,
    });
  }
};


const getAllMerchants = async (req, res) => {
  try {
    const merchants = await Merchant.findAll({
      order: [['createdAt', 'DESC']] // latest merchants first
    });

    res.json({
      success: true,
      count: merchants.length,
      data: merchants,
    });
  } catch (error) {
    console.error('Error fetching merchants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch merchants',
      error: error.message,
    });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        {
          model: Merchant,
          attributes: ['id', 'businessName', 'email']
        }
      ],
      attributes: [
        'id',
        'merchantId',
        'amount',
        'currency',
        'status',
        'type',
        'createdAt',
        'updatedAt'
      ],
      order: [['createdAt', 'DESC']] // latest transactions first
    });

    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message,
    });
  }
};

const createPlan = async (req, res) => {
  try {
    const requiredFields = ["type", "name", "billing_cycle", "pricing"];
    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(422).json({ message: `${field} is required` });
      }
    }

    const {
      type,
      name,
      billing_cycle,
      pricing,
      start_date,
      end_date,
      merchant,
      no_of_branches,
      no_of_customers,
      no_of_agents
    } = req.body;

    let merchantId = null;

    // if merchant is provided, validate it
    if (merchant) {
      const foundMerchant = await Merchant.findByPk(merchant);
      if (!foundMerchant) {
        return res.status(404).json({ success: false, message: "Invalid merchant ID" });
      }
      merchantId = foundMerchant.id;
    }

     // ✅ validate start_date
    if (start_date && isNaN(Date.parse(start_date))) {
      return res.status(422).json({ success: false, message: "Invalid start_date format" });
    }

    // ✅ validate end_date
    if (end_date && isNaN(Date.parse(end_date))) {
      return res.status(422).json({ success: false, message: "Invalid end_date format" });
    }

    // ✅ ensure end_date is not before start_date
    if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
      return res.status(422).json({ success: false, message: "end_date cannot be earlier than start_date" });
    }

    const newPlan = await Plan.create({
      type,
      name,
      billing_cycle,
      pricing,
      start_date,
      end_date,
      merchantId,
      no_of_branches,
      no_of_customers,
      no_of_agents,
    });

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: newPlan
    });
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create plan",
      error: error.message
    });
  }
};

const getAllPlans = async (req, res) => {
  try {
    const { type } = req.query; // filter by query param

    const whereClause = {};
    if (type) {
      whereClause.type = type; // apply filter only if provided
    }

    const plans = await Plan.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
      error: error.message,
    });
  }
};

const createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    if (!name) return res.status(422).json({ message: "Role name is required" });

    // validate permissions
    if (permissions && !permissions.every(p => PERMISSIONS.includes(p))) {
      return res.status(422).json({ message: "One or more permissions are invalid" });
    }

    const role = await AdminRole.create({ name, permissions });
    res.status(201).json({ success: true, message: "Role created successfully", data: role });
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({ success: false, message: "Failed to create role", error: error.message });
  }
};


const getAllPermissions = async (req, res) => {
  res.json({ success: true, data: PERMISSIONS });
};

const getAllRoles = async (req, res) => {
  try {
    const roles = await AdminRole.findAll({ order: [["createdAt", "DESC"]] });
    res.json({ success: true, count: roles.length, data: roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ success: false, message: "Failed to fetch roles", error: error.message });
  }
};

const createAdminStaff = async (req, res) => {
  try {
    const { name, email, phoneNumber, password, roleId } = req.body;

    const requiredFields = ["name", "email", "phoneNumber", "password", "roleId"];
    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(422).json({ message: `${field} is required` });
      }
    }

    // check if role exists
    const role = await AdminRole.findByPk(roleId);
    if (!role) return res.status(404).json({ message: "Invalid role ID" });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await AdminStaff.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      roleId,
      status: "active",
    });

    res.status(201).json({ success: true, message: "Admin staff created successfully", data: staff });
  } catch (error) {
    console.error("Error creating admin staff:", error);
    res.status(500).json({ success: false, message: "Failed to create admin staff", error: error.message });
  }
};

const getAllAdminStaff = async (req, res) => {
  try {
    const staff = await AdminStaff.findAll({
      include: [{ model: AdminRole, attributes: ["id", "name", "permissions"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    console.error("Error fetching admin staff:", error);
    res.status(500).json({ success: false, message: "Failed to fetch admin staff", error: error.message });
  }
};

const getAllAdminLogs = async (req, res) => {
  try {
    const logs = await AdminLogService.getAllLogs();
    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching admin logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin logs',
      error: error.message,
    });
  }
};

const getAdminLogsByStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    if (!staffId) {
      return res.status(422).json({ message: "staffId is required" });
    }

    const logs = await AdminLogService.getLogsByStaff(staffId);
    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching logs for staff:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logs for staff',
      error: error.message,
    });
  }
};





module.exports = {
  loginSuperAdmin,
  getMerchantStats,
  getSuperAdminStats,
  getAllActivities,
  getAllMerchants,
  getAllTransactions,
  createPlan,
  getAllPlans,
  createRole,
  getAllPermissions,
  getAllRoles,
  createAdminStaff,
  getAllAdminStaff,
  getAllAdminLogs,
  getAdminLogsByStaff
};
