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

print("=== PM2 Backend Error Logs ===")
stdin, stdout, stderr = ssh.exec_command("pm2 logs alphaweb-backend --nostream --lines 60 2>&1 | tail -80")
print(stdout.read().decode('utf-8', errors='ignore'))

print("\n=== Remittance Table Columns ===")
stdin, stdout, stderr = ssh.exec_command(
    "mysql -u$(grep DB_USER /home/mayowae/public_html/alphaweb/backend/.env | cut -d= -f2) "
    "-p$(grep DB_PASS /home/mayowae/public_html/alphaweb/backend/.env | cut -d= -f2) "
    "$(grep DB_NAME /home/mayowae/public_html/alphaweb/backend/.env | cut -d= -f2) "
    "-e 'DESCRIBE remittances;' 2>&1"
)
print(stdout.read().decode('utf-8', errors='ignore'))

print("\n=== Activity Table Columns ===")
stdin, stdout, stderr = ssh.exec_command(
    "mysql -u$(grep DB_USER /home/mayowae/public_html/alphaweb/backend/.env | cut -d= -f2) "
    "-p$(grep DB_PASS /home/mayowae/public_html/alphaweb/backend/.env | cut -d= -f2) "
    "$(grep DB_NAME /home/mayowae/public_html/alphaweb/backend/.env | cut -d= -f2) "
    "-e 'DESCRIBE activities;' 2>&1"
)
print(stdout.read().decode('utf-8', errors='ignore'))

print("\n=== CustomerWallet Table Columns ===")
stdin, stdout, stderr = ssh.exec_command(
    "mysql -u$(grep DB_USER /home/mayowae/public_html/alphaweb/backend/.env | cut -d= -f2) "
    "-p$(grep DB_PASS /home/mayowae/public_html/alphaweb/backend/.env | cut -d= -f2) "
    "$(grep DB_NAME /home/mayowae/public_html/alphaweb/backend/.env | cut -d= -f2) "
    "-e 'DESCRIBE customer_wallets;' 2>&1"
)
print(stdout.read().decode('utf-8', errors='ignore'))

ssh.close()
