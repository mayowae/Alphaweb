import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace'), stderr.read().decode('utf-8', errors='replace')

# Check key issues:
# 1) Merchant model uses planId (camelCase) as FK but the DB column is plan_id  
# 2) The belongsTo uses foreignKey: 'planId' - does Sequelize know to map to plan_id?
print("=== Merchant model planId definition ===")
out, err = run("sed -n '78,100p' /home/mayowae/public_html/alphaweb/backend/models/merchant.js")
print(out)

# 3) Does Subscription model have merchantId?
print("=== Subscription model ===")
out, err = run("cat /home/mayowae/public_html/alphaweb/backend/models/subscription.js")
print(out)

# 4) Check backend error logs for any crash after the build
print("=== Backend error log tail ===")
out, err = run("tail -n 50 /home/mayowae/public_html/alphaweb/logs/backend-error-0.log")
print(out)

client.close()
