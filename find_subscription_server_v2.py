import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

cmd = 'grep "/subscription" /home/mayowae/public_html/alphaweb/backend/server.js'
stdin, stdout, stderr = client.exec_command(cmd)

print("--- /subscription in server.js ---")
print(stdout.read().decode('utf-8'))

client.close()
