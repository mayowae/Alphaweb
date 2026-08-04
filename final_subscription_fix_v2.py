import paramiko
import os
import re

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8')

# New Merchant model content with ALL fields
new_merchant_model = """
module.exports = (sequelize, DataTypes) => {
  const Merchant = sequelize.define('Merchant', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    businessAlias: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    accountLevel: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Tier 0',
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    wallet_balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    wallet_status: {
      type: DataTypes.STRING,
      defaultValue: 'Active',
    },
    subscription_status: {
      type: DataTypes.STRING,
      defaultValue: 'Active',
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    total_debt: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
    },
    trial_end_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    next_billing_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'merchants',
    timestamps: true,
    underscored: false,
  });

  Merchant.associate = (models) => {
    Merchant.belongsTo(models.Plan, { foreignKey: 'plan_id', as: 'plan' });
    Merchant.hasMany(models.InvestmentApplication, { foreignKey: 'merchantId' });
    Merchant.hasMany(models.LoanApplication, { foreignKey: 'merchantId' });
    Merchant.hasMany(models.CustomerWallet, { foreignKey: 'merchantId' });
    Merchant.hasMany(models.Agent, { foreignKey: 'merchantId', as: 'agents' });
    Merchant.hasMany(models.Customer, { foreignKey: 'merchantId', as: 'customers' });
    Merchant.hasMany(models.Subscription, { foreignKey: 'merchantId', as: 'history' });
  };

  return Merchant;
};
"""

controller_path = '/home/mayowae/public_html/alphaweb/backend/controllers/merchantManagementController.js'
# Updated getMySubscription to include relations
new_get_my_sub = """
// Get current logged-in merchant subscription
const getMySubscription = async (req, res) => {
  try {
    const id = req.user.id;
    const { Merchant, Plan, Subscription, Agent } = require('../models');

    const merchant = await Merchant.findByPk(id, {
      include: [
        { model: Plan, as: 'plan' }
      ]
    });

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found',
      });
    }

    const history = await Subscription.findAll({
      where: { merchantId: id },
      include: [{ model: Plan, as: 'plan' }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    const agentCount = await Agent.count({ where: { merchantId: id } });

    res.json({
      success: true,
      data: {
        merchant: merchant,
        history: history,
        agentCount: agentCount
      },
    });
  } catch (error) {
    console.error('Error fetching my subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription',
      error: error.message,
    });
  }
};
"""

print("=== Updating Merchant Model ===")
with open('merchant.js', 'w', encoding='utf-8') as f:
    f.write(new_merchant_model)
sftp = client.open_sftp()
sftp.put('merchant.js', '/home/mayowae/public_html/alphaweb/backend/models/merchant.js')

print("=== Updating Controller ===")
content = run(f'cat {controller_path}')
pattern = r'// Get current logged-in merchant subscription.*?\n};'
updated_content = re.sub(pattern, new_get_my_sub, content, flags=re.DOTALL)

with open('temp_controller.js', 'w', encoding='utf-8') as f:
    f.write(updated_content)
sftp.put('temp_controller.js', controller_path)
sftp.close()

print("=== Restarting backend ===")
run('pm2 restart alphaweb-backend')

client.close()
os.remove('merchant.js')
os.remove('temp_controller.js')
print("Done.")
