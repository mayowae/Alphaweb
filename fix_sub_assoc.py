import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('fix_assoc_output.txt', 'w', encoding='utf-8')

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

def p(msg):
    log.write(str(msg) + '\n')
    log.flush()

# The current subscription association block is:
# db.Merchant.hasMany(db.Subscription, { foreignKey: 'merchantId', as: 'subscriptions' });
# db.Subscription.belongsTo(db.Merchant, { foreignKey: 'merchantId', as: 'subscriptionMerchant' });
#
# We need to ADD:
# db.Subscription.belongsTo(db.Plan, { foreignKey: 'planId', as: 'plan' });
# db.Plan.hasMany(db.Subscription, { foreignKey: 'planId', as: 'subscriptions' });

old_block = """// Subscription associations
db.Merchant.hasMany(db.Subscription, { foreignKey: 'merchantId', as: 'subscriptions' });
db.Subscription.belongsTo(db.Merchant, { foreignKey: 'merchantId', as: 'subscriptionMerchant' });"""

new_block = """// Subscription associations
db.Merchant.hasMany(db.Subscription, { foreignKey: 'merchantId', as: 'subscriptions' });
db.Subscription.belongsTo(db.Merchant, { foreignKey: 'merchantId', as: 'subscriptionMerchant' });
db.Subscription.belongsTo(db.Plan, { foreignKey: 'planId', as: 'plan' });
db.Plan.hasMany(db.Subscription, { foreignKey: 'planId', as: 'planSubscriptions' });
// Plan ↔ Merchant (for subscription page include)
db.Plan.hasMany(db.Merchant, { foreignKey: 'planId', as: 'merchants' });"""

# Read current index.js
index_path = '/home/mayowae/public_html/alphaweb/backend/models/index.js'
sftp = client.open_sftp()
with sftp.open(index_path, 'r') as f:
    content = f.read().decode('utf-8')

if 'db.Subscription.belongsTo(db.Plan' in content:
    p("Association already exists - no change needed.")
else:
    new_content = content.replace(old_block, new_block)
    if new_content == content:
        p("ERROR: Could not find the target block to replace!")
        p("Current subscription block:")
        start = content.find('// Subscription associations')
        p(content[start:start+300])
    else:
        with sftp.open(index_path, 'w') as f:
            f.write(new_content.encode('utf-8'))
        p("SUCCESS: Added Subscription->Plan association to models/index.js")

sftp.close()

# Restart backend
run("pm2 restart alphaweb-backend")
p("Backend restarted.")

import time
time.sleep(5)

# Test the endpoint still working
out = run("curl -s http://127.0.0.1:5000/api/merchant/subscription")
p("Subscription endpoint (no token): " + out)

out = run("tail -n 10 /home/mayowae/public_html/alphaweb/logs/backend-out-0.log")
p("Backend out log tail:\n" + out)

log.close()
print("Done - see fix_assoc_output.txt")
client.close()
