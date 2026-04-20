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

print("=== Recent approve errors ===")
stdin, stdout, stderr = ssh.exec_command(
    "cat ~/.pm2/logs/alphaweb-backend-error.log 2>/dev/null | grep -i -A5 'approve' | tail -60"
)
print(stdout.read().decode('utf-8', errors='ignore') or "(none)")

print("\n=== All recent error log (last 30 non-JWT lines) ===")
stdin, stdout, stderr = ssh.exec_command(
    "cat ~/.pm2/logs/alphaweb-backend-error.log 2>/dev/null | grep -v 'jwt expired' | grep -v 'Token' | grep -v 'Secret' | tail -60"
)
print(stdout.read().decode('utf-8', errors='ignore') or "(none)")

print("\n=== remittances table schema ===")
stdin, stdout, stderr = ssh.exec_command(
    "PGPASSWORD='AlphaWeb2026!' psql -U alpha_admin -d alphacollect_db -c '\\d remittances' 2>&1"
)
print(stdout.read().decode('utf-8', errors='ignore'))

print("\n=== activities table schema ===")
stdin, stdout, stderr = ssh.exec_command(
    "PGPASSWORD='AlphaWeb2026!' psql -U alpha_admin -d alphacollect_db -c '\\d activities' 2>&1"
)
print(stdout.read().decode('utf-8', errors='ignore'))

ssh.close()
