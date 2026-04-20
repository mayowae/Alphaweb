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

# Read the backend env for postgres credentials
print("=== Backend .env ===")
stdin, stdout, stderr = ssh.exec_command(
    "cat /home/mayowae/public_html/alphaweb/backend/.env"
)
print(stdout.read().decode('utf-8', errors='ignore'))

# Get recent non-jwt errors
print("\n=== Recent non-JWT backend errors ===")
stdin, stdout, stderr = ssh.exec_command(
    "grep -v 'jwt expired\\|Token that\\|JWT Secret\\|verification error' "
    "~/.pm2/logs/alphaweb-backend-error.log 2>/dev/null | tail -80"
)
print(stdout.read().decode('utf-8', errors='ignore') or "(none)")

# Check server.js remittance routes
print("\n=== Remittance routes in server.js ===")
stdin, stdout, stderr = ssh.exec_command(
    "grep -n -i 'remittance\\|approve' /home/mayowae/public_html/alphaweb/backend/server.js | head -30"
)
print(stdout.read().decode('utf-8', errors='ignore'))

ssh.close()
