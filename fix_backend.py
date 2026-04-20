import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('fix_backend.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

BASE = '/home/mayowae/public_html/alphaweb'

# 1. Check what error the backend is throwing
p("=== Backend error log (last 40 lines) ===")
out = run(f"tail -n 40 {BASE}/logs/backend-error-0.log")
p(out)

# 2. Check backend out log for crash reason
p("\n=== Backend out log (last 20) ===")
out = run(f"tail -n 20 {BASE}/logs/backend-out-0.log")
p(out)

# 3. Check Nginx full config
p("\n=== Nginx config ===")
out = run("cat /etc/nginx/conf.d/alphaweb.conf")
p(out)

# 4. Check if merchantManagementController is syntactically valid
p("\n=== Syntax check merchantManagementController ===")
out = run(f"node --check {BASE}/backend/controllers/merchantManagementController.js 2>&1")
p(out if out.strip() else "Syntax OK")

p("\n=== Syntax check billingService ===")
out = run(f"node --check {BASE}/backend/services/billingService.js 2>&1")
p(out if out.strip() else "Syntax OK")

p("\n=== Syntax check agentController ===")
out = run(f"node --check {BASE}/backend/controllers/agentController.js 2>&1")
p(out if out.strip() else "Syntax OK")

# 5. Read services/api.tsx getMerchantSubscription
p("\n=== services/api.tsx getMerchantSubscription function ===")
out = run(f"sed -n '150,175p' {BASE}/services/api.tsx")
p(out)

log.close()
print("Done - see fix_backend.txt")
client.close()
