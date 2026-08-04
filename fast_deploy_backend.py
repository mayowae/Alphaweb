import paramiko
import os

# Credentials
hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

local_file = r'c:\Users\trade\Documents\Alphaweb-main\backend\controllers\investmentTransactionController.js'
remote_file = '/home/mayowae/public_html/alphaweb/backend/controllers/investmentTransactionController.js'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port, username, password, timeout=30)
    
    with ssh.open_sftp() as sftp:
        sftp.put(local_file, remote_file)
    print("Upload successful!")
    
    ssh.exec_command("pm2 restart alphaweb-backend")
    print("Backend restarted!")
    
    ssh.close()
except Exception as e:
    print(f"Error: {e}")
