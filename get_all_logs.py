import paramiko
import sys
sys.stdout.reconfigure(encoding='utf-8')

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname, port=port, username=username, password=password)

print("=== All Backend Logs (Last 100 lines) ===")
stdin, stdout, stderr = ssh.exec_command(
    "pm2 logs alphaweb-backend --nostream --lines 100"
)
print(stdout.read().decode('utf-8', errors='ignore'))

ssh.close()
