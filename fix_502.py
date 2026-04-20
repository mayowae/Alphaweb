import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('fix_502.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

BASE = '/home/mayowae/public_html/alphaweb'

# Step 1: Kill everything on port 3000
p("=== Kill all on port 3000 ===")
out = run("fuser -k 3000/tcp 2>&1; echo done")
p(out)
time.sleep(2)

# Step 2: Check what's on port 3000
p("=== Port 3000 status ===")
out = run("netstat -tunlp | grep 3000")
p(out if out.strip() else "Nothing on port 3000")

# Step 3: Check latest frontend error log
p("\n=== Frontend error log (latest) ===")
out = run(f"ls -lt {BASE}/logs/ | head -10")
p(out)
out = run(f"tail -n 30 {BASE}/logs/frontend-error-6.log 2>/dev/null || ls {BASE}/logs/ | grep front")
p(out)

# Step 4: Delete broken pm2 entry and re-add from ecosystem
p("\n=== PM2 delete and restart from ecosystem ===")
run("pm2 delete alphaweb-frontend")
time.sleep(2)
run(f"cd {BASE} && pm2 start ecosystem.config.js --only alphaweb-frontend")
time.sleep(8)

# Step 5: Check port and status
p("\n=== Port 3000 after restart ===")
out = run("netstat -tunlp | grep 3000")
p(out if out.strip() else "Still nothing on port 3000")

p("\n=== Frontend error log after restart ===")
out = run(f"ls -lt {BASE}/logs/ | head -5")
p(out)
# Get the newest frontend error log
out = run(f"ls {BASE}/logs/ | grep 'frontend-error' | sort -V | tail -1")
latest_err = out.strip()
p(f"Latest error log: {latest_err}")
if latest_err:
    out = run(f"tail -n 30 {BASE}/logs/{latest_err}")
    p(out)

# Step 6: HTTP test
time.sleep(5)
out = run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/")
p(f"\nHTTP status port 3000: {out}")

log.close()
print("Done - see fix_502.txt")
client.close()
