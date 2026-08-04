import paramiko
import os

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

# 1. Update merchantManagementController.js to add getMySubscription
controller_path = '/home/mayowae/public_html/alphaweb/backend/controllers/merchantManagementController.js'
content = run(f'cat {controller_path}')

if 'getMySubscription' not in content:
    # Add the method before the module.exports
    new_method = """
// Get current logged-in merchant subscription
const getMySubscription = async (req, res) => {
  try {
    const id = req.user.id;
    const { Merchant } = require('../models');

    const merchant = await Merchant.findByPk(id);
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: 'Merchant not found',
      });
    }

    const subscriptionData = {
      currentPlan: merchant.isVerified ? 'Basic' : 'Free',
      status: merchant.isVerified ? 'Active' : 'Inactive',
      billingCycle: 'Monthly',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: 'Not set',
    };

    res.json({
      success: true,
      data: subscriptionData,
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
    # Insert before module.exports
    updated_content = content.replace('module.exports = {', new_method + '\nmodule.exports = {')
    # Add to exports
    updated_content = updated_content.replace('getMerchantLogs,', 'getMerchantLogs,\n  getMySubscription,')
    
    with open('temp_controller.js', 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    sftp = client.open_sftp()
    sftp.put('temp_controller.js', controller_path)
    sftp.close()
    print("Updated merchantManagementController.js with getMySubscription")

# 2. Update server.js to add the route
server_path = '/home/mayowae/public_html/alphaweb/backend/server.js'
server_content = run(f'cat {server_path}')

if "app.get('/merchant/subscription'" not in server_content:
    # Find a good place to insert (near other merchant routes or dashboard routes)
    insertion_point = "app.get('/merchant/profile'"
    new_route = "app.get('/merchant/subscription', verifyToken, requireAuthenticated, merchantManagementController.getMySubscription);\n"
    
    updated_server = server_content.replace(insertion_point, new_route + insertion_point)
    
    with open('temp_server.js', 'w', encoding='utf-8') as f:
        f.write(updated_server)
    
    sftp = client.open_sftp()
    sftp.put('temp_server.js', server_path)
    sftp.close()
    print("Updated server.js with /merchant/subscription route")

# 3. Restart backend
run('pm2 restart alphaweb-backend')
print("Restarted backend.")

client.close()
if os.path.exists('temp_controller.js'): os.remove('temp_controller.js')
if os.path.exists('temp_server.js'): os.remove('temp_server.js')
