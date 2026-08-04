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

print("=== PM2 Status ===")
print(run("pm2 status"))

print("\n=== Ports Listening ===")
print(run("netstat -tulpn | grep -E ':3000|:5000|:4000'"))

print("\n=== Frontend Logs (last 50 lines) ===")
print(run("pm2 logs alphaweb-frontend --lines 50 --nostream"))

print("\n=== Backend Logs (last 50 lines) ===")
print(run("pm2 logs alphaweb-backend --lines 50 --nostream"))

client.close()
