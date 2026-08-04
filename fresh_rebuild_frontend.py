import paramiko
import time
import os
import sys
sys.stdout.reconfigure(encoding='utf-8')

hostname = '159.198.36.24'
FRONTEND_PATH = '/home/mayowae/public_html/alphaweb'
LOCAL_BASE = os.path.dirname(os.path.abspath(__file__))

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=22, username='root', password='96eUC4aTbMu1o3yAP2', timeout=30)

def run(cmd):
    _, stdout, stderr = client.exec_command(cmd, timeout=600)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    combined = (out + err).strip()
    if combined: print(combined)
    return out

print("=== KILLING PM2 FRONTEND ===")
run("pm2 delete alphaweb-frontend || true")
run("fuser -k 3000/tcp || true")

print("\n=== CLEANING BUILD ARTIFACTS ===")
run(f"cd {FRONTEND_PATH} && rm -rf .next")

print("\n=== REBUILDING FRONTEND (THIS MAY TAKE 2-3 MINUTES) ===")
run(f'cd {FRONTEND_PATH} && export NODE_OPTIONS="--max-old-space-size=1536" && npm run build')

print("\n=== STARTING FRONTEND VIA PM2 ===")
run(f"cd {FRONTEND_PATH} && pm2 start npm --name alphaweb-frontend -- start")

time.sleep(10)
run("pm2 list")

out = run("netstat -tulpn | grep :3000")
if ":3000" in out:
    print("\nSUCCESS: Frontend is UP on port 3000!")
else:
    print("\nSTILL STARTING... Checking logs:")
    run("pm2 logs alphaweb-frontend --lines 20 --nostream")

client.close()
