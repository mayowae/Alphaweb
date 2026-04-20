import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('fix_billing_output.txt', 'w', encoding='utf-8')

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

def p(msg):
    log.write(str(msg) + '\n')
    log.flush()

BASE = '/home/mayowae/public_html/alphaweb/backend'

# Step 1: Check if node-cron is already available
p("=== Check if node-cron is available ===")
out = run(f"ls {BASE}/node_modules | grep cron")
p(out if out.strip() else "(not installed)")

# Step 2: Install node-cron 
p("\n=== Installing node-cron ===")
out = run(f"cd {BASE} && npm install node-cron --save 2>&1 | tail -5")
p(out)

# Step 3: Check signup code for trial_end_date setting
p("\n=== Signup code (lines 100-140 of authController) ===")
out = run(f"sed -n '100,140p' {BASE}/controllers/authController.js")
p(out)

# Step 4: Check how Merchant.create is called
p("\n=== Merchant.create call ===")
out = run(f"grep -n -A 20 'Merchant.create' {BASE}/controllers/authController.js | head -40")
p(out)

log.close()
print("Done - see fix_billing_output.txt")
client.close()
