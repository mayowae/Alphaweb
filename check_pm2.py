import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('159.198.36.24', 22, 'root', '96eUC4aTbMu1o3yAP2')
stdin, stdout, stderr = client.exec_command('pm2 list')
with open('pm2_status.txt', 'w', encoding='utf-8') as f:
    f.write(stdout.read().decode('utf-8', 'ignore'))
client.close()
