import paramiko

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

# Read current content
content = run('cat /home/mayowae/public_html/alphaweb/backend/models/merchant.js')

# Add underscored: false to the options
if 'underscored:' not in content:
    new_content = content.replace(
        'timestamps: true,',
        'timestamps: true,\n    underscored: false,'
    )
    
    # Write it back
    with open('temp_merchant.js', 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    sftp = client.open_sftp()
    sftp.put('temp_merchant.js', '/home/mayowae/public_html/alphaweb/backend/models/merchant.js')
    sftp.close()
    print("Updated merchant.js with underscored: false")
else:
    print("underscored setting already exists in merchant.js")

# Restart backend
run('pm2 restart alphaweb-backend')
print("Restarted backend.")

client.close()
import os
if os.path.exists('temp_merchant.js'):
    os.remove('temp_merchant.js')
