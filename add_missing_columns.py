import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

# Add source column to collections
cmd1 = "sudo -u postgres psql -d alphacollect_db -c \"ALTER TABLE collections ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'Web';\""
# Also check for other common missing columns like 'payment_method' or similar if they appeared in logs
# Based on the INSERT query in the error log: 
# "INSERT INTO "collections" (..."source") VALUES (...,$18) RETURNING ... "source";"
# It seems "source" is the one that caused the crash.

stdin, stdout, stderr = client.exec_command(cmd1)
print("--- Update Collections Schema ---")
print(stdout.read().decode('utf-8'), stderr.read().decode('utf-8'))

# Restart backend just in case
client.exec_command('pm2 restart alphaweb-backend')

client.close()
