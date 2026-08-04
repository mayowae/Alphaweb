import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

# Try to describe the table
cmd = 'export PGPASSWORD=AteieujeW4Ddd0u1WaqKWKemDkJfFWe4; psql -h dpg-d6e9bsvgi27c738r2k3g-a.oregon-postgres.render.com -U alphadb_y2ju_user -d alphadb_y2ju_q0iq -c "\\\d merchants"'
stdin, stdout, stderr = client.exec_command(cmd)

print("--- Describe Table ---")
print(stdout.read().decode('utf-8'))
print(stderr.read().decode('utf-8'))

client.close()
