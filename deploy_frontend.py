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

# Restart or Rebuild?
# Given the user's urgency, I'll try to trigger a build if possible, 
# but if the server is in dev mode it might be enough.
# Let's check if there is a .next folder
stdin, stdout, stderr = client.exec_command(f"ls -d {project_dir}/.next")
has_next_dir = stdout.read().decode().strip() != ""

if has_next_dir:
    print("Detected .next directory. Running build...")
    # Using the same high memory option from package.json
    build_cmd = f"cd {project_dir} && export NODE_OPTIONS=--max-old-space-size=4096 && npm run build"
    stdin, stdout, stderr = client.exec_command(build_cmd)
    # This might take a while, so we might want to run it in background or wait.
    # For now, let's just trigger it and print logs.
    print("Build triggered. This may take a few minutes.")
    # Actually, let's wait for it.
    print(stdout.read().decode('utf-8'))
    print(stderr.read().decode('utf-8'))
    
    print("Restarting PM2...")
    client.exec_command("pm2 restart all")
else:
    print("No .next directory found. Restarting PM2 only.")
    client.exec_command("pm2 restart all")

client.close()
print("Frontend deployment complete")
