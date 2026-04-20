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
local_single_ctrl = r'c:\Users\trade\Documents\Alphaweb-main\src\components\SingleCollectionForm.tsx'
local_bulk_ctrl = r'c:\Users\trade\Documents\Alphaweb-main\src\components\BulkCollectionForm.tsx'

# Remote paths
project_dir = "/home/mayowae/public_html/alphaweb"
remote_single_ctrl = f"{project_dir}/src/components/SingleCollectionForm.tsx"
remote_bulk_ctrl = f"{project_dir}/src/components/BulkCollectionForm.tsx"

# Upload files
print(f"Uploading {local_single_ctrl}...")
sftp.put(local_single_ctrl, remote_single_ctrl)
print(f"Uploading {local_bulk_ctrl}...")
sftp.put(local_bulk_ctrl, remote_bulk_ctrl)

sftp.close()

# Restart/Rebuild
# Check if there is a .next folder
stdin, stdout, stderr = client.exec_command(f"ls -d {project_dir}/.next")
has_next_dir = stdout.read().decode().strip() != ""

if has_next_dir:
    print("Detected .next directory. Running build in background...")
    build_cmd = f"cd {project_dir} && export NODE_OPTIONS=--max-old-space-size=4096 && nohup npm run build > build_frontend.log 2>&1 &"
    client.exec_command(build_cmd)
    print("Build started in background. Check build_frontend.log for progress.")
else:
    print("No .next directory found. Restarting PM2...")
    client.exec_command("pm2 restart all")

client.close()
print("Frontend files uploaded and build/restart triggered.")
