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
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

BASE = '/home/mayowae/public_html/alphaweb'

# Re-upload fixed component and trigger build
sftp = client.open_sftp()
sftp.put(
    r'C:\Users\trade\Documents\Alphaweb-main\local_edit\SubscriptionsBillings.tsx',
    f'{BASE}/src/components/tables/merchants/merchantdetailstabs/Subscriptions&Billings.tsx'
)
sftp.close()

# Start build in background using nohup
client.exec_command(f'cd {BASE} && nohup npm run build > build_billing.log 2>&1 &')
print("Build started. Use check_build2.py to monitor.")
client.close()
