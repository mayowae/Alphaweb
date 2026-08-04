import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'yft1x2X89Z0MZrAvM9'

# Local path
local_file = r'c:\Users\trade\Documents\Alphaweb-main\backend\controllers\dashboardController.js'
# Remote path
remote_file = '/home/mayowae/public_html/alphaweb/backend/controllers/dashboardController.js'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {hostname}...")
    client.connect(hostname, port=port, username=username, password=password, timeout=30)
    print("Connected successfully")

    # Upload the file
    sftp = client.open_sftp()
    print(f"Uploading {local_file} to {remote_file}...")
    sftp.put(local_file, remote_file)
    sftp.close()
    print("Upload complete")

    # Restart the backend
    print("Restarting alphaweb-backend...")
    stdin, stdout, stderr = client.exec_command("pm2 restart alphaweb-backend")
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    
    if out: print(f"STDOUT: {out}")
    if err: print(f"STDERR: {err}")

    client.close()
    print("Deployment finished successfully")

except Exception as e:
    print(f"Deployment failed: {e}")
