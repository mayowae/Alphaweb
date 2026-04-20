import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('trial_check.txt', 'w', encoding='utf-8')

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

def p(msg):
    log.write(str(msg) + '\n')
    log.flush()

BASE = '/home/mayowae/public_html/alphaweb/backend'

# 1. What trial_end_date is set on signup?
p("=== Trial date set on merchant signup (authController) ===")
out = run(f"grep -n 'trial\\|Trial\\|free\\|FREE' {BASE}/controllers/authController.js | head -30")
p(out)

# 2. Full billingService
p("\n=== billingService.js ===")
out = run(f"cat {BASE}/services/billingService.js")
p(out)

# 3. What schedules/cron jobs exist?
p("\n=== Cron/scheduler in server.js ===")
out = run(f"grep -n 'cron\\|schedule\\|setInterval\\|billing\\|trial' {BASE}/server.js | head -30")
p(out)

# 4. Current merchants trial_end_date data
p("\n=== Current merchants trial data in DB ===")
out = run("PGPASSWORD='AlphaWeb2026!' psql -h localhost -U alpha_admin -d alphacollect_db -c \"SELECT id, email, subscription_status, trial_end_date, next_billing_date, created_at FROM merchants ORDER BY created_at DESC LIMIT 10;\"")
p(out)

log.close()
print("Done - see trial_check.txt")
client.close()
