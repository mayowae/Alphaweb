import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

files_to_upload = [
    {
        'local': r'c:\Users\trade\Documents\Alphaweb-main\src\app\dashboard\(pages)\package\(pages)\collection\page.tsx',
        'remote': '/home/mayowae/public_html/alphaweb/src/app/dashboard/(pages)/package/(pages)/collection/page.tsx'
    }
]

def run_remote_command(ssh, command):
    print(f"Running: {command}")
    stdin, stdout, stderr = ssh.exec_command(command)
    # We read line by line to avoid encoding issues on large chunks
    for line in stdout:
        print(line.strip())
    for line in stderr:
        print(f"ERR: {line.strip()}")

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port, username, password)
    print("Connected to VPS")

    with ssh.open_sftp() as sftp:
        for f in files_to_upload:
            print(f"Uploading {f['local']} to {f['remote']}...")
            sftp.put(f['local'], f['remote'])
    
    print("Upload successful. Rebuilding...")
    run_remote_command(ssh, "cd /home/mayowae/public_html/alphaweb && npm run build")
    
    print("Restarting processes...")
    run_remote_command(ssh, "fuser -k 3000/tcp")
    run_remote_command(ssh, "pm2 restart alphaweb-frontend")
    run_remote_command(ssh, "pm2 restart alphaweb-backend")
    
    ssh.close()
    print("Deployment and Repair Finished!")

except Exception as e:
    print(f"FAILED: {e}")
