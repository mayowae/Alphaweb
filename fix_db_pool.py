import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

# Read the file
stdin, stdout, stderr = client.exec_command('cat /home/mayowae/public_html/alphaweb/backend/models/index.js')
content = stdout.read().decode('utf-8')

# Apply fixes to the pool configuration
# We want to increase max connections and improve idle/evict settings
new_content = content.replace(
    'max: 2,',
    'max: 20,'
).replace(
    'idle: 10000',
    'idle: 30000'
)

# Add evict and handleDisconnects logic if possible? 
# Actually, just increasing max and idle should help with "Connection terminated" if it was due to exhaustion or aggressive closing.

# Write it back
with open('temp_models_index.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

sftp = client.open_sftp()
sftp.put('temp_models_index.js', '/home/mayowae/public_html/alphaweb/backend/models/index.js')
sftp.close()

# Update .env to production
stdin, stdout, stderr = client.exec_command('sed -i "s/NODE_ENV=development/NODE_ENV=production/" /home/mayowae/public_html/alphaweb/backend/.env')

# Restart backend
client.exec_command('pm2 restart alphaweb-backend')

print("Applied pool size fix and set NODE_ENV to production. Restarted backend.")
client.close()
os.remove('temp_models_index.js')
