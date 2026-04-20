import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

local_file = r'c:\Users\trade\Documents\Alphaweb-main\src\app\dashboard\(pages)\package\(pages)\loan\page.tsx'
remote_file = '/home/mayowae/public_html/alphaweb/src/app/dashboard/(pages)/package/(pages)/loan/page.tsx'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port, username, password)
    print("Connected to SSH")

    sftp = ssh.open_sftp()
    print(f"Uploading {local_file} to {remote_file}")
    sftp.put(local_file, remote_file)
    sftp.close()
    print("Upload complete")

    print("Rebuilding frontend (this may take a few minutes)...")
    # Increase memory limit for build if needed
    build_cmd = "cd /home/mayowae/public_html/alphaweb && rm -rf .next && npm run build"
    stdin, stdout, stderr = ssh.exec_command(build_cmd)
    
    # Wait for completion and show output
    exit_status = stdout.channel.recv_exit_status()
    if exit_status == 0:
        print("Build successful")
    else:
        print(f"Build FAILED with exit status {exit_status}")
    
    print("Restarting alphaweb-frontend...")
    ssh.exec_command("pm2 restart alphaweb-frontend")
    
    ssh.close()
    print("Deployment finished!")

except Exception as e:
    print(f"Error during deployment: {e}")
