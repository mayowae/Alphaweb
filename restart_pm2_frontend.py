import paramiko
import time
import sys
sys.stdout.reconfigure(encoding='utf-8')

hostname = '159.198.36.24'
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=22, username='root', password='96eUC4aTbMu1o3yAP2', timeout=30)

def run(cmd):
    _, stdout, stderr = client.exec_command(cmd, timeout=60)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    combined = (out + err).strip()
    if combined:
        print(combined)
    return out

# Kill any stray npm start processes competing for port 3000
print("=== Killing any stray processes on port 3000 ===")
run("fuser -k 3000/tcp 2>/dev/null || true")
time.sleep(2)

# Restart the PM2 frontend (id 1 = alphaweb-frontend)
print("\n=== Restarting PM2 frontend (alphaweb-frontend) ===")
run("pm2 restart alphaweb-frontend")
time.sleep(8)

# Verify it's up
print("\n=== Checking port 3000 ===")
out = run("netstat -tulpn | grep :3000")
if ':3000' in out:
    print("Frontend is UP on port 3000!")
else:
    print("Port 3000 not yet open, checking PM2 status...")
    run("pm2 list --no-color")
    run("tail -20 /home/mayowae/public_html/alphaweb/logs/frontend-out-1.log 2>/dev/null || tail -20 /home/mayowae/public_html/alphaweb/dev.log")

client.close()
print("\n=== Done ===")
