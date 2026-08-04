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

print("=== KILLING PORT 3000 ===")
run("fuser -k 3000/tcp || true")
time.sleep(2)

print("\n=== RESTARTING FRONTEND VIA PM2 ===")
run("pm2 restart alphaweb-frontend || pm2 restart 1")
time.sleep(10)

print("\n=== CHECKING IF PORT 3000 IS LISTENING ===")
out = run("netstat -tulpn | grep :3000")
if ":3000" in out:
    print("SUCCESS: Port 3000 is listening.")
else:
    print("FAILURE: Port 3000 is NOT listening.")
    print("\n=== LATEST FRONTEND LOGS ===")
    run("pm2 logs alphaweb-frontend --lines 50 --nostream")

client.close()
