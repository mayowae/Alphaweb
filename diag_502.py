import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('diag_502.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

BASE = '/home/mayowae/public_html/alphaweb'

# 1. Is frontend up?
p("=== Frontend port 3000 ===")
out = run("netstat -tunlp | grep 3000")
p(out if out.strip() else "NOTHING on port 3000 — frontend DOWN")

# 2. HTTP status from nginx and direct
p("\n=== HTTP checks ===")
out = run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/")
p(f"Direct port 3000 /: {out}")
out = run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5000/api/merchant/subscription")
p(f"Backend port 5000 /api/merchant/subscription: {out}")

# 3. NEXT_PUBLIC_API_URL
p("\n=== NEXT_PUBLIC_API_URL ===")
out = run(f"grep 'NEXT_PUBLIC_API_URL' {BASE}/.env.production")
p(out)

# 4. Nginx config - does /api route to 5000?
p("\n=== Nginx /api routing ===")
out = run("grep -A5 '/api' /etc/nginx/conf.d/alphaweb.conf | head -30")
p(out)

# 5. PM2 status
p("\n=== PM2 status ===")
out = run("pm2 list 2>&1 | grep -E 'alphaweb|status'")
p(out)

# 6. Frontend error log
p("\n=== Frontend logs (last 20 lines) ===")
out = run(f"ls -t {BASE}/logs/ | grep frontend | head -5")
p(out)
logs = [l.strip() for l in out.split('\n') if 'error' in l and l.strip()]
if logs:
    out = run(f"tail -n 20 '{BASE}/logs/{logs[0]}'")
    p(out)

# 7. Check services/api.ts for getMerchantSubscription
p("\n=== services/api getMerchantSubscription ===")
out = run(f"find {BASE}/services -name '*.ts' -o -name '*.js' 2>/dev/null | head -5")
p("Services files: " + out)
out = run(f"find {BASE} -maxdepth 3 -name 'api.ts' 2>/dev/null")
p("api.ts locations: " + out)
out = run(f"grep -rn 'getMerchantSubscription' {BASE}/services/ 2>/dev/null | head -5")
p("getMerchantSubscription def: " + out)

log.close()
print("Done - see diag_502.txt")
client.close()
