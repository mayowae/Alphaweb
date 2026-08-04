import paramiko
import time
import sys
sys.stdout.reconfigure(encoding='utf-8')

hostname = '159.198.36.24'
BACKEND_PATH = '/home/mayowae/public_html/alphaweb/backend'
import os
LOCAL_BASE = os.path.dirname(os.path.abspath(__file__))

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

# Upload the updated loanController
print('=== Uploading loanController.js ===')
sftp = client.open_sftp()
sftp.put(
    os.path.join(LOCAL_BASE, 'backend', 'controllers', 'loanController.js'),
    f'{BACKEND_PATH}/controllers/loanController.js'
)
sftp.close()
print('Upload done.')

# Restart backend via PM2
print('\n=== Restarting alphaweb-backend ===')
run('pm2 restart alphaweb-backend --no-color')
time.sleep(4)

# Confirm backend is up
print('\n=== PM2 status ===')
run('pm2 list --no-color')

client.close()
print('\n=== Done – backend restarted with package name fix ===')
