import paramiko
import sys
import io
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

print("Starting in fork mode...")
client.exec_command('pm2 delete alphaweb-backend')
client.exec_command('cd /home/mayowae/public_html/alphaweb/backend && pm2 start server.js --name alphaweb-backend')
time.sleep(5)

print("\n--- PM2 LIST ---")
stdin, stdout, stderr = client.exec_command('pm2 list')
print(stdout.read().decode('utf-8', errors='replace'))

print("\n--- ERROR LOGS ---")
stdin, stdout, stderr = client.exec_command('pm2 logs alphaweb-backend --err --lines 20 --no-colors')
# Wait for logs to be captured
time.sleep(2)
print(stdout.read().decode('utf-8', errors='replace'))

client.close()
