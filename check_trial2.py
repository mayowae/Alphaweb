import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('trial_check2.txt', 'w', encoding='utf-8')

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

def p(msg):
    log.write(str(msg) + '\n')
    log.flush()

BASE = '/home/mayowae/public_html/alphaweb/backend'

# 1. Current merchants trial data (DB columns are camelCase)
p("=== Current merchants trial/subscription data ===")
out = run("""PGPASSWORD='AlphaWeb2026!' psql -h localhost -U alpha_admin -d alphacollect_db -c \
  'SELECT id, email, subscription_status, trial_end_date, next_billing_date, "createdAt" FROM merchants ORDER BY "createdAt" DESC LIMIT 10;'""")
p(out)

# 2. Check server.js for cron/billing schedule
p("\n=== Full server.js billing/cron section ===")
out = run(f"grep -n 'billing\\|cron\\|setInterval\\|schedule\\|runBilling\\|BILLING' {BASE}/server.js")
p(out)

# 3. Check .env for TRIAL_MONTHS
p("\n=== TRIAL_MONTHS env var ===")
out = run(f"grep 'TRIAL' {BASE}/.env")
p(out if out.strip() else "(TRIAL_MONTHS not set — defaults to 3 months)")

# 4. Check if there's a cron package installed
p("\n=== Cron packages installed ===")
out = run(f"cat {BASE}/package.json | grep -i 'cron\\|schedule\\|node-cron'")
p(out if out.strip() else "(No cron package found in package.json)")

log.close()
print("Done - see trial_check2.txt")
client.close()
