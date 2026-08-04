import paramiko
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
    return out + err

print("=== dev.log (last 60 lines) ===")
print(run("tail -60 /home/mayowae/public_html/alphaweb/dev.log"))

print("\n=== PM2 error log ===")
print(run("pm2 logs alphaweb-frontend --lines 40 --nostream --err 2>&1 || pm2 logs 1 --lines 40 --nostream --err 2>&1"))

client.close()
