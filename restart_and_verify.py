import paramiko
import time
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

# Restart and check
print("=== Restarting backend ===")
client.exec_command('pm2 restart alphaweb-backend')
time.sleep(5)

print("\n=== PM2 Status ===")
stdin, stdout, stderr = client.exec_command('pm2 list')
print(stdout.read().decode('utf-8', errors='replace'))

print("\n=== Recent error logs ===")
stdin, stdout, stderr = client.exec_command('tail -n 10 /root/.pm2/logs/alphaweb-backend-error.log')
print(stdout.read().decode('utf-8', errors='replace'))

print("\n=== Recent out logs ===")
stdin, stdout, stderr = client.exec_command('tail -n 10 /root/.pm2/logs/alphaweb-backend-out.log')
print(stdout.read().decode('utf-8', errors='replace'))

client.close()
