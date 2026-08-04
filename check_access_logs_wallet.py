import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

cmd = "tail -n 100 /var/log/nginx/access.log | grep \"/wallet/balance\""
stdin, stdout, stderr = client.exec_command(cmd)

print("--- Wallet balance in access logs ---")
print(stdout.read().decode('utf-8'))

client.close()
