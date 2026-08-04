import paramiko
import sys
import time

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

    def run(cmd, timeout=30):
        stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
        out = stdout.read().decode('utf-8', errors='replace')
        err = stderr.read().decode('utf-8', errors='replace')
        return out + ("\nERR: " + err if err.strip() else "")

    # Check if build artifact exists
    print("\n=== BUILD_ID Check ===")
    print(run(f"ls -la {FRONTEND_PATH}/.next/BUILD_ID 2>&1"))

    # Check the last 5 lines of error log (fast)
    print("\n=== Last errors ===")
    print(run("tail -n 20 /root/.pm2/logs/alphaweb-frontend-error.log"))

    # Check if port 3000 is actually listening RIGHT NOW
    print("\n=== Port 3000 RIGHT NOW ===")
    print(run("ss -tulpn | grep :3000"))

    # pm2 status
    print("\n=== PM2 Status ===")
    print(run("pm2 jlist | python3 -c \"import sys,json; p=[x for x in json.load(sys.stdin) if x['name']=='alphaweb-frontend'][0]; print('status:', p['pm2_env']['status'], 'restarts:', p['pm2_env']['restart_time'], 'pid:', p['pid'])\""))

    client.close()
except Exception as e:
    print(f"Failed: {e}")
