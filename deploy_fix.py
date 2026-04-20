import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

sftp = client.open_sftp()

# Local paths
local_customer_ctrl = r'c:\Users\trade\Documents\Alphaweb-main\backend\controllers\customerController.js'
local_collection_ctrl = r'c:\Users\trade\Documents\Alphaweb-main\backend\controllers\collectionController.js'

# Remote paths
project_dir = "/home/mayowae/public_html/alphaweb"
remote_customer_ctrl = f"{project_dir}/backend/controllers/customerController.js"
remote_collection_ctrl = f"{project_dir}/backend/controllers/collectionController.js"

# Upload files
print(f"Uploading {local_customer_ctrl}...")
sftp.put(local_customer_ctrl, remote_customer_ctrl)
print(f"Uploading {local_collection_ctrl}...")
sftp.put(local_collection_ctrl, remote_collection_ctrl)

sftp.close()

# Restart backend
print("Restarting backend...")
stdin, stdout, stderr = client.exec_command("pm2 restart all")
print("PM2 restart output:")
print(stdout.read().decode('utf-8'))
print(stderr.read().decode('utf-8'))

client.close()
print("Deployment complete")
