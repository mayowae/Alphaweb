import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port, username, password, timeout=30)

    # Wait 5 seconds then check for NEW errors after restart
    time.sleep(5)

    # Get only the very latest log lines (after restart)
    stdin, stdout, stderr = ssh.exec_command("pm2 logs alphaweb-backend --lines 5 --nostream")
    print("=== Latest logs after restart ===")
    out = stdout.read().decode('utf-8', 'ignore')
    print(out)

    # Also grep for any new Investment.status queries vs InvestmentApplication
    stdin, stdout, stderr = ssh.exec_command(
        "grep -c 'InvestmentApplication' /home/mayowae/public_html/alphaweb/backend/controllers/investmentTransactionController.js"
    )
    count = stdout.read().decode('utf-8', 'ignore').strip()
    print(f"=== InvestmentApplication occurrences in deployed file: {count} ===")

    # Check if old Investment status query still exists
    stdin, stdout, stderr = ssh.exec_command(
        "grep -c \"Op.in.*'Active'.*'Closed'.*'Completed'\" /home/mayowae/public_html/alphaweb/backend/controllers/investmentTransactionController.js"
    )
    old_count = stdout.read().decode('utf-8', 'ignore').strip()
    print(f"=== Old Investment status queries remaining: {old_count} ===")

    ssh.close()
except Exception as e:
    print(f"Error: {e}")
