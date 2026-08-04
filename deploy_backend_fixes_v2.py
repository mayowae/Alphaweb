import paramiko
import time
import os
import sys
sys.stdout.reconfigure(encoding='utf-8')

hostname = '159.198.36.24'
BACKEND_PATH = '/home/mayowae/public_html/alphaweb/backend'
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

# 1. Upload updated backend files
print('=== Uploading backend fixes ===')
backend_files = [
    ('backend/controllers/customerWalletController.js', f'{BACKEND_PATH}/controllers/customerWalletController.js'),
]
for local_rel, remote in backend_files:
    upload(local_rel, remote)

# 2. Restart backend
print('\n=== Restarting backend ===')
run('pm2 restart alphaweb-backend || pm2 restart 0')

time.sleep(3)
run('pm2 list')

client.close()
print('\n=== Backend Deploy complete ===')
