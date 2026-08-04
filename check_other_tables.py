import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

cmd1 = "sudo -u postgres psql -d alphacollect_db -c \"\\d loans\""
cmd2 = "sudo -u postgres psql -d alphacollect_db -c \"\\d investments\""

print("--- Loans Table Schema ---")
stdin, stdout, stderr = client.exec_command(cmd1)
print(stdout.read().decode('utf-8'))

print("--- Investments Table Schema ---")
stdin, stdout, stderr = client.exec_command(cmd2)
print(stdout.read().decode('utf-8'))

client.close()
