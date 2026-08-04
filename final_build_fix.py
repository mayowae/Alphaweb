import paramiko
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
    print(f"\n--- Running: {cmd} ---")
    stdin, stdout, stderr = client.exec_command(cmd, timeout=900)
    while True:
        line = stdout.readline()
        if not line: break
        print(line, end='')
    err = stderr.read().decode('utf-8', errors='replace')
    if err: print(f"\nERR: {err}")

def upload(local_rel, remote_path):
    local_full = os.path.join(LOCAL_BASE, local_rel.replace('/', os.sep))
    print(f'  Uploading {local_rel}')
    sftp = client.open_sftp()
    sftp.put(local_full, remote_path)
    sftp.close()

upload('package.json', f'{FRONTEND_PATH}/package.json')

print("\n=== STARTING BUILD WITH LINUX-FIXED SCRIPTS ===")
run(f"cd {FRONTEND_PATH} && npm run build")

print("\n=== RESTARTING FRONTEND ===")
run(f"pm2 restart alphaweb-frontend || (cd {FRONTEND_PATH} && pm2 start npm --name alphaweb-frontend -- start)")

client.close()
