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

print("=== Last 100 lines of PM2 backend error log ===")
stdin, stdout, stderr = ssh.exec_command(
    "cat ~/.pm2/logs/alphaweb-backend-error.log 2>/dev/null | tail -100 || "
    "pm2 logs alphaweb-backend --err --nostream --lines 80 2>&1 | tail -100"
)
out = stdout.read().decode('utf-8', errors='ignore')
err = stderr.read().decode('utf-8', errors='ignore')
print(out or err or "(no output)")

print("\n=== Check remittances table columns on DB ===")
# Read credentials from backend .env on server
stdin, stdout, stderr = ssh.exec_command(
    "cat /home/mayowae/public_html/alphaweb/backend/.env 2>/dev/null | grep -E 'DB_|DATABASE'"
)
print(stdout.read().decode('utf-8', errors='ignore'))

ssh.close()
