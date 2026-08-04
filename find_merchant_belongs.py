import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

cmd = 'grep "belongsTo" /home/mayowae/public_html/alphaweb/backend/models/merchant.js'
stdin, stdout, stderr = client.exec_command(cmd)

print("--- belongsTo in merchant.js ---")
print(stdout.read().decode('utf-8'))

client.close()
