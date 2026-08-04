import paramiko
import os

# Credentials provided by user
hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

# Files to upload
files_to_upload = [
    (r'backend\controllers\investmentTransactionController.js', '/home/mayowae/public_html/alphaweb/backend/controllers/investmentTransactionController.js'),
    (r'src\components\InvestmentTransactionForm.tsx', '/home/mayowae/public_html/alphaweb/src/components/InvestmentTransactionForm.tsx'),
    (r'src\app\dashboard\(pages)\investment\(pages)\transactions\page.tsx', '/home/mayowae/public_html/alphaweb/src/app/dashboard/(pages)/investment/(pages)/transactions/page.tsx'),
]

def run_remote_command(ssh, command):
    print(f"Running: {command}")
    stdin, stdout, stderr = ssh.exec_command(command)
    # Read output but handle encoding carefully
    out = stdout.read().decode('utf-8', 'ignore').strip()
    err = stderr.read().decode('utf-8', 'ignore').strip()
    if out: print(f"OUT: {out}")
    if err: print(f"ERR: {err}")
    return out, err

try:
    print(f"Connecting to {hostname}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port, username, password, timeout=30)
    print("Connected!")

    # 1. Upload the modified files
    with ssh.open_sftp() as sftp:
        for local_path, remote_path in files_to_upload:
            # Handle Windows backslashes
            local_full_path = os.path.join(r'c:\Users\trade\Documents\Alphaweb-main', local_path)
            print(f"Uploading {local_full_path} to {remote_path}...")
            # Ensure remote directory exists (simple way)
            remote_dir = os.path.dirname(remote_path)
            ssh.exec_command(f"mkdir -p {remote_dir}")
            sftp.put(local_full_path, remote_path)
    print("All uploads successful!")

    # 2. Restart backend
    print("Restarting backend...")
    run_remote_command(ssh, "pm2 restart alphaweb-backend")
    print("Backend restarted!")

    # 3. Rebuild frontend
    print("Building frontend (this may take a while)...")
    # Using nohup or similar to prevent timeout issues if needed, but pm2 will handle the process
    # Actually, we should run build and then restart frontend
    run_remote_command(ssh, "cd /home/mayowae/public_html/alphaweb && npm run build")
    print("Frontend build finished!")

    print("Restarting frontend...")
    run_remote_command(ssh, "pm2 restart alphaweb-frontend")
    print("Frontend restarted!")

    ssh.close()
    print("Done!")

except Exception as e:
    print(f"Error: {e}")
