import paramiko
import os

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

    # 1. Upload the file
    print("Uploading file...")
    with ssh.open_sftp() as sftp:
        sftp.put(local_file, remote_file)
    print("Upload done!")

    # 2. Verify the upload contains the new code
    stdin, stdout, stderr = ssh.exec_command(
        f"grep 'InvestmentApplication' {remote_file} | head -5"
    )
    print("=== Verify InvestmentApplication in file ===")
    print(stdout.read().decode('utf-8', 'ignore'))

    # 3. Check what status values the query now uses
    stdin, stdout, stderr = ssh.exec_command(
        f"grep -n 'Approved.*Closed\\|Closed.*Approved\\|activeApplication\\|activeInvestment' {remote_file} | head -20"
    )
    print("=== Key lines in uploaded file ===")
    print(stdout.read().decode('utf-8', 'ignore'))

    # 4. Force stop and restart pm2
    print("Force restarting backend...")
    stdin, stdout, stderr = ssh.exec_command("pm2 stop alphaweb-backend && pm2 start alphaweb-backend")
    stdout.read()
    stderr.read()
    print("Backend restarted!")

    # 5. Wait a moment then check logs
    import time
    time.sleep(3)
    stdin, stdout, stderr = ssh.exec_command("pm2 logs alphaweb-backend --lines 10 --nostream")
    print("=== Fresh logs ===")
    print(stdout.read().decode('utf-8', 'ignore'))

    ssh.close()
except Exception as e:
    print(f"Error: {e}")
