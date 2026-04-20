import paramiko
import os

# Credentials provided by user
hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

# Path to the file we modified
local_file = r'c:\Users\trade\Documents\Alphaweb-main\src\app\dashboard\(pages)\package\(pages)\collection\page.tsx'
remote_file = '/home/mayowae/public_html/alphaweb/src/app/dashboard/(pages)/package/(pages)/collection/page.tsx'

def run_remote_command(ssh, command):
    print(f"Running: {command}")
    stdin, stdout, stderr = ssh.exec_command(command)
    # Use read().decode() but be careful with large output
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out: print(f"OUT: {out}")
    if err: print(f"ERR: {err}")
    return out, err

try:
    print(f"Connecting to {hostname}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port, username, password, timeout=30)
    print("Connected!")

    # 1. Upload the modified file
    print(f"Uploading {local_file} to {remote_file}...")
    with ssh.open_sftp() as sftp:
        sftp.put(local_file, remote_file)
    print("Upload successful!")

    # 2. Rebuild the frontend
    # Note: npm run build can be slow and resource-intensive
    print("Rebuilding frontend (this may take a minute)...")
    run_remote_command(ssh, "cd /home/mayowae/public_html/alphaweb && npm run build")
    
    # 3. Restart the frontend process
    print("Restarting frontend process...")
    run_remote_command(ssh, "pm2 restart alphaweb-frontend")

    ssh.close()
    print("Deployment complete and verified!")

except Exception as e:
    print(f"FAILED: {e}")
