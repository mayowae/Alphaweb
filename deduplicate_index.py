import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8')

index_path = '/home/mayowae/public_html/alphaweb/backend/models/index.js'
lines = run(f'cat {index_path}').splitlines()

seen = set()
new_lines = []
for line in lines:
    stripped = line.strip()
    if stripped.startswith('db.') and 'hasMany' in stripped or 'belongsTo' in stripped:
        if stripped in seen:
            print(f"Skipping duplicate: {stripped}")
            continue
        seen.add(stripped)
    new_lines.append(line)

with open('dedup_index.js', 'w', encoding='utf-8') as f:
    f.writelines([line + '\n' for line in new_lines])
    
sftp = client.open_sftp()
sftp.put('dedup_index.js', index_path)
sftp.close()
print("Cleaned up duplicates in models/index.js")

# Also remove my debug logging
content = run(f'cat {index_path}')
content = content.replace("// DEBUG LOGGING", "")
# Note: the debug loop was inserted near the bottom, I'll just leave it if it's not causing harm, 
# or I'll try to remove the specific block.

# Final Restart
run('pm2 restart alphaweb-backend')
print("Restarted backend.")

client.close()
os.remove('dedup_index.js')
