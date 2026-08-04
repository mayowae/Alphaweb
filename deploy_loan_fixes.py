import paramiko
import time
import os
import sys

# Force UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

BACKEND_PATH = '/home/mayowae/public_html/alphaweb/backend'
FRONTEND_PATH = '/home/mayowae/public_html/alphaweb'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=300)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    combined = (out + err).strip()
    if combined:
        print(combined)
    return out, err

# ── 1. Restart backend ────────────────────────────────────────────────────────
print('\n=== Restarting backend ===')
out, _ = run('pm2 list --no-color')
if 'alpha-backend' in out:
    run('pm2 restart alpha-backend')
elif 'backend' in out.lower():
    run('pm2 restart backend')
else:
    run('pm2 restart 0 || true')

time.sleep(3)
print('Backend restarted.')

# ── 2. Rebuild frontend ───────────────────────────────────────────────────────
print('\n=== Rebuilding frontend ===')
run('fuser -k 3000/tcp || true')
time.sleep(2)

build_cmd = (
    f'cd {FRONTEND_PATH} && '
    'export NODE_OPTIONS="--max-old-space-size=1536" && '
    'npm run build > /tmp/build_loan_fix.log 2>&1'
)
print('Building... this usually takes 3-5 minutes, please wait.')
run(build_cmd)

# Check result
out2, _ = run('tail -40 /tmp/build_loan_fix.log')

if 'error' in out2.lower() and 'compiled successfully' not in out2.lower() and 'route (app)' not in out2.lower():
    print('\n[!] Build may have errors – check /tmp/build_loan_fix.log on server')
else:
    print('\n=== Build succeeded – starting app ===')
    run(
        f'cd {FRONTEND_PATH} && '
        '(nohup env NODE_OPTIONS="--max-old-space-size=1536" npm start > dev.log 2>&1 &)'
    )
    time.sleep(10)
    out3, _ = run('netstat -tulpn | grep :3000')
    if ':3000' in out3:
        print('\nFrontend is UP on port 3000!')
    else:
        print('Port 3000 not yet open – it may still be starting. Check dev.log.')

client.close()
print('\n=== Deploy complete ===')
