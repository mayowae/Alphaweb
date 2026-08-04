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

# Try with a very small pool size
new_content = content.replace(
    'max: 20,',
    'max: 2,'
).replace(
    'max: 5,', # In case I changed it elsewhere
    'max: 2,'
)

# Write it back
with open('temp_models_index_low.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

sftp = client.open_sftp()
sftp.put('temp_models_index_low.js', '/home/mayowae/public_html/alphaweb/backend/models/index.js')
sftp.close()

# Restart backend
client.exec_command('pm2 restart alphaweb-backend')

print("Decreased pool size to 2 (safe for Render limits). Restarted backend.")
client.close()
os.remove('temp_models_index_low.js')
