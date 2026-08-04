import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

# Get the collection model to find ALL fields the app expects
cmd = "cat /home/mayowae/public_html/alphaweb/backend/models/collection.js"
stdin, stdout, stderr = client.exec_command(cmd)
print("--- Collection Model ---")
print(stdout.read().decode('utf-8'))

print("\n\n--- Remittance Model ---")
cmd2 = "cat /home/mayowae/public_html/alphaweb/backend/models/remittance.js"
stdin, stdout, stderr = client.exec_command(cmd2)
print(stdout.read().decode('utf-8'))

client.close()
