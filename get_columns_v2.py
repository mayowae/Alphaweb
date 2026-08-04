import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('159.198.36.24', 22, 'root', '96eUC4aTbMu1o3yAP2')

cmd = "sudo -u postgres psql alphacollect_db -c \"SELECT column_name FROM information_schema.columns WHERE table_name = 'customer_wallets'\""
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode())
print(stderr.read().decode())
client.close()
