import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('rebuild_output.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

BASE = '/home/mayowae/public_html/alphaweb'

# Re-upload fixed component
sftp = client.open_sftp()
sftp.put(
    r'C:\Users\trade\Documents\Alphaweb-main\local_edit\SubscriptionsBillings.tsx',
    f'{BASE}/src/components/tables/merchants/merchantdetailstabs/Subscriptions&Billings.tsx'
)
sftp.close()
p("Re-uploaded SubscriptionsBillings.tsx with fixed import path")

# Rebuild
p("Starting rebuild...")
client.exec_command(f'cd {BASE} && npm run build > build_billing.log 2>&1')
p("Build started in background.")
p("Waiting 3 minutes...")

time.sleep(180)

# Check build result
out = run(f"tail -n 20 {BASE}/build_billing.log")
p("Build log:\n" + out)

log.close()
print("Done - see rebuild_output.txt")
client.close()
