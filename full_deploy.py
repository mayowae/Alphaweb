import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

files_to_upload = [
    {
        'local': r'c:\Users\trade\Documents\Alphaweb-main\backend\controllers\packageController.js',
        'remote': '/home/mayowae/public_html/alphaweb/backend/controllers/packageController.js'
    },
    {
        'local': r'c:\Users\trade\Documents\Alphaweb-main\src\app\dashboard\(pages)\package\(pages)\collection\page.tsx',
        'remote': '/home/mayowae/public_html/alphaweb/src/app/dashboard/(pages)/package/(pages)/collection/page.tsx'
    },
    {
        'local': r'c:\Users\trade\Documents\Alphaweb-main\src\app\dashboard\(pages)\collection\(pages)\remittance\page.tsx',
        'remote': '/home/mayowae/public_html/alphaweb/src/app/dashboard/(pages)/collection/(pages)/remittance/page.tsx'
    }
]

def run_remote_command(ssh, command):
    print(f"Running: {command}")
    stdin, stdout, stderr = ssh.exec_command(command)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out: print(f"OUT: {out}")
    if err: print(f"ERR: {err}")
    return out, err

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port, username, password)
    print("Connected to VPS")

    with ssh.open_sftp() as sftp:
        for f in files_to_upload:
            print(f"Uploading {f['local']} to {f['remote']}...")
            sftp.put(f['local'], f['remote'])
    
    print("Uploads complete.")

    # Building frontend
    print("Building frontend...")
    run_remote_command(ssh, "cd /home/mayowae/public_html/alphaweb && npm run build")

    # Restarting services
    print("Restarting services...")
    run_remote_command(ssh, "pm2 restart alphaweb-backend")
    run_remote_command(ssh, "pm2 restart alphaweb-frontend")

    ssh.close()
    print("Deployment finished!")

except Exception as e:
    print(f"Deployment FAILED: {e}")
