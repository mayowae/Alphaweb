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
    _, stdout, stderr = client.exec_command(cmd, timeout=300)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    combined = (out + err).strip()
    if combined: print(combined)
    return out

def upload(local_rel, remote_path):
    local_full = os.path.join(LOCAL_BASE, local_rel.replace('/', os.sep))
    print(f'  Uploading {local_rel}')
    sftp = client.open_sftp()
    sftp.put(local_full, remote_path)
    sftp.close()

# 1. Upload updated frontend applications page
print('=== Uploading frontend applications page ===')
upload(
    'src/app/dashboard/(pages)/loan/(pages)/applications/page.tsx',
    f'{FRONTEND_PATH}/src/app/dashboard/(pages)/loan/(pages)/applications/page.tsx'
)

# 2. Rebuild frontend
print('\n=== Rebuilding frontend ===')
run('fuser -k 3000/tcp 2>/dev/null || true')
time.sleep(2)
run(f'cd {FRONTEND_PATH} && export NODE_OPTIONS="--max-old-space-size=1536" && npm run build > /tmp/build_applications.log 2>&1')

# 3. Restart PM2 frontend
print('\n=== Restarting PM2 frontend ===')
run('pm2 restart alphaweb-frontend --no-color')
time.sleep(8)

out = run('netstat -tulpn | grep :3000')
if ':3000' in out:
    print('Frontend is UP on port 3000!')
else:
    print('Still starting... check logs')

client.close()
print('\n=== Deploy complete ===')
