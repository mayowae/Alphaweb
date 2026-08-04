import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

hostname = '159.198.36.24'
password = '96eUC4aTbMu1o3yAP2'
FRONTEND_PATH = '/home/mayowae/public_html/alphaweb'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect(hostname, port=22, username='root', password=password, timeout=10)
    print("Connected")
    
    def run(cmd):
        print(f"\n--- {cmd} ---")
        stdin, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode('utf-8', errors='replace'))
        err = stderr.read().decode('utf-8', errors='replace')
        if err: print(f"ERR: {err}")

    run(f"ls -la {FRONTEND_PATH}/.next/BUILD_ID")
    run("pm2 status")
    run("curl -Is http://localhost:3000 | head -n 1")
    
    client.close()
except Exception as e:
    print(f"Failed: {e}")
