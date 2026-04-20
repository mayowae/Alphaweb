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
    return stdout.read().decode('utf-8', errors='replace')

path = '/home/mayowae/public_html/alphaweb/backend/controllers/merchantManagementController.js'
content = run(f"cat {path}")

# Replace camelCase with underscored
mappings = {
    'merchant.planId': 'merchant.plan_id',
    'merchant.subscriptionStatus': 'merchant.subscription_status',
    'merchant.nextBillingDate': 'merchant.next_billing_date',
    'merchant.totalDebt': 'merchant.total_debt',
    'merchant.trialEndDate': 'merchant.trial_end_date',
    'merchant.isCustomFee': 'merchant.is_custom_fee',
    'merchant.customFee': 'merchant.custom_fee'
}

for old, new in mappings.items():
    content = content.replace(old, new)

with open("mmc_new.js", "w", encoding="utf-8") as f:
    f.write(content)

sftp = client.open_sftp()
sftp.put("mmc_new.js", path)
sftp.close()

client.exec_command('pm2 restart alphaweb-backend')
client.close()
print("Merchant Management Controller updated.")
