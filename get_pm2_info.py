import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

cmd = "pm2 show alphaweb-frontend --no-color"
stdin, stdout, stderr = client.exec_command(cmd)

with open('pm2_frontend.txt', 'wb') as f:
    f.write(stdout.read())

client.close()
