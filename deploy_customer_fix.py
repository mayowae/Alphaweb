import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

HOST = '159.198.36.24'
PASSWORD = 'yft1x2X89Z0MZrAvM9'
LOCAL = r'c:\Users\trade\Documents\Alphaweb-main\src\app\dashboard\(pages)\customer\page.tsx'
REMOTE = '/home/mayowae/public_html/alphaweb/src/app/dashboard/(pages)/customer/page.tsx'
REMOTE_DIR = '/home/mayowae/public_html/alphaweb'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
print('Connecting...')
ssh.connect(HOST, 22, 'root', PASSWORD, timeout=60)

sftp = ssh.open_sftp()
print('Uploading customer page...')
sftp.put(LOCAL, REMOTE)
sftp.close()

print('Building frontend...')
stdin, stdout, stderr = ssh.exec_command(
    f"cd {REMOTE_DIR} && NODE_OPTIONS='--max-old-space-size=2048' npm run build",
    timeout=900
)
out = stdout.read().decode('utf-8', errors='replace')
print('Build OK' if 'Compiled successfully' in out else out[-1500:])

stdin, stdout, stderr = ssh.exec_command('pm2 restart alphaweb-frontend')
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
print('Done.')
