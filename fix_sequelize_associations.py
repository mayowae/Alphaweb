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

index_path = '/home/mayowae/public_html/alphaweb/backend/models/index.js'
content = run(f'cat {index_path}')

# 1. Remove any previously added partial associations at the end of the file
# (Specifically the ones I added near db.Transaction)
content = content.replace("db.Merchant.hasMany(db.Subscription, { foreignKey: 'merchantId', as: 'history' });\ndb.Subscription.belongsTo(db.Merchant, { foreignKey: 'merchantId' });", "")

# 2. Add all Merchant associations in the correct place (after Staff)
assoc_block = """
// Merchant Extended Associations
db.Merchant.belongsTo(db.Plan, { foreignKey: 'plan_id', as: 'plan' });
db.Merchant.hasMany(db.InvestmentApplication, { foreignKey: 'merchantId' });
db.Merchant.hasMany(db.LoanApplication, { foreignKey: 'merchantId' });
db.Merchant.hasMany(db.CustomerWallet, { foreignKey: 'merchantId' });
db.Merchant.hasMany(db.Agent, { foreignKey: 'merchantId', as: 'agents' });
db.Merchant.hasMany(db.Customer, { foreignKey: 'merchantId', as: 'customers' });
db.Merchant.hasMany(db.Subscription, { foreignKey: 'merchantId', as: 'history' });
db.Subscription.belongsTo(db.Plan, { foreignKey: 'planId', as: 'plan' });
"""

insertion_point = "db.Staff.belongsTo(db.Merchant, { foreignKey: 'merchantId' });"

if "db.Merchant.belongsTo(db.Plan" not in content:
    updated_content = content.replace(insertion_point, insertion_point + assoc_block)
    
    with open('final_index.js', 'w', encoding='utf-8') as f:
        f.write(updated_content)
        
    sftp = client.open_sftp()
    sftp.put('final_index.js', index_path)
    sftp.close()
    print("Updated models/index.js with full associations in the correct place")
else:
    print("Associations already present in index.js")

# Restart backend
run('pm2 restart alphaweb-backend')
print("Restarted backend.")

client.close()
os.remove('final_index.js')
