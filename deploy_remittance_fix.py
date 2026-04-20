import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password)

sftp = client.open_sftp()

# Project Dir
project_dir = "/home/mayowae/public_html/alphaweb"

# Backend update
local_ctrl = r'c:\Users\trade\Documents\Alphaweb-main\backend\controllers\collectionController.js'
remote_ctrl = f"{project_dir}/backend/controllers/collectionController.js"
sftp.put(local_ctrl, remote_ctrl)

# Frontend update
local_page = r'c:\Users\trade\Documents\Alphaweb-main\src\app\dashboard\(pages)\collection\(pages)\remittance\page.tsx'
remote_page = f"{project_dir}/src/app/dashboard/(pages)/collection/(pages)/remittance/page.tsx"
sftp.put(local_page, remote_page)

sftp.close()

# Restart backend and rebuild frontend
print("Restarting backend...")
client.exec_command("pm2 restart alphaweb-backend")

print("Starting frontend build...")
build_cmd = f"cd {project_dir} && export NODE_OPTIONS=--max-old-space-size=4096 && nohup npm run build > build_remittance.log 2>&1 &"
client.exec_command(build_cmd)

client.close()
print("Deployment triggered.")
