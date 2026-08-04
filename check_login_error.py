import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

cmd = 'grep -A 20 "Login error:" /root/.pm2/logs/alphaweb-backend-error.log | tail -n 50'
stdin, stdout, stderr = client.exec_command(cmd)

print("--- Login Error Logs ---")
print(stdout.read().decode('utf-8'))

client.close()
