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

print("=== Checking approveRemittance on Server ===")
stdin, stdout, stderr = ssh.exec_command(
    "grep -n -A 100 'const approveRemittance' /home/mayowae/public_html/alphaweb/backend/controllers/remittanceController.js | head -110"
)
print(stdout.read().decode('utf-8', errors='ignore'))

ssh.close()
