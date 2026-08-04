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

# 1. Update merchant.js: Remove the associate block
print("=== Cleaning up merchant.js associate block ===")
merchant_path = '/home/mayowae/public_html/alphaweb/backend/models/merchant.js'
merchant_content = run(f'cat {merchant_path}')

clean_merchant = re.sub(r'Merchant\.associate = \(models\) => \{.*?\}\;', '', merchant_content, flags=re.DOTALL)

with open('clean_merchant.js', 'w', encoding='utf-8') as f:
    f.write(clean_merchant)
sftp = client.open_sftp()
sftp.put('clean_merchant.js', merchant_path)

# 2. Update index.js: Move all associations here
print("=== Moving associations to index.js ===")
index_path = '/home/mayowae/public_html/alphaweb/backend/models/index.js'
index_content = run(f'cat {index_path}')

# Add all the associations I wanted to index.js
assoc_block = """
// Merchant Associations
db.Merchant.belongsTo(db.Plan, { foreignKey: 'plan_id', as: 'plan' });
db.Merchant.hasMany(db.InvestmentApplication, { foreignKey: 'merchantId' });
db.Merchant.hasMany(db.LoanApplication, { foreignKey: 'merchantId' });
db.Merchant.hasMany(db.CustomerWallet, { foreignKey: 'merchantId' });
db.Merchant.hasMany(db.Agent, { foreignKey: 'merchantId', as: 'agents' });
db.Merchant.hasMany(db.Customer, { foreignKey: 'merchantId', as: 'customers' });
db.Merchant.hasMany(db.Subscription, { foreignKey: 'merchantId', as: 'history' });
db.Subscription.belongsTo(db.Plan, { foreignKey: 'planId', as: 'plan' });
"""

if 'db.Merchant.belongsTo(db.Plan' not in index_content:
    # Insert after initial merchant associations
    insertion_point = "db.Merchant.hasMany(db.Staff, { foreignKey: 'merchantId' });\ndb.Staff.belongsTo(db.Merchant, { foreignKey: 'merchantId' });"
    updated_index = index_content.replace(insertion_point, insertion_point + assoc_block)
    
    with open('updated_index.js', 'w', encoding='utf-8') as f:
        f.write(updated_index)
    sftp.put('updated_index.js', index_path)

sftp.close()

# 3. Restart backend
print("=== Restarting backend ===")
run('pm2 restart alphaweb-backend')

client.close()
os.remove('clean_merchant.js')
if os.path.exists('updated_index.js'): os.remove('updated_index.js')
print("Done.")
