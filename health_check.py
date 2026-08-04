import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port, username, password, timeout=30)

    # Check PM2 process status
    stdin, stdout, stderr = ssh.exec_command("pm2 list")
    print("=== PM2 Processes ===")
    print(stdout.read().decode('utf-8', 'ignore'))

    # Check latest backend logs
    stdin, stdout, stderr = ssh.exec_command("pm2 logs alphaweb-backend --lines 15 --nostream")
    print("=== Latest Backend Logs ===")
    print(stdout.read().decode('utf-8', 'ignore'))
    print(stderr.read().decode('utf-8', 'ignore'))

    # Confirm the correct file is on server
    stdin, stdout, stderr = ssh.exec_command(
        "grep -n 'InvestmentApplication\\|activeApplication\\|activeInvestment' "
        "/home/mayowae/public_html/alphaweb/backend/controllers/investmentTransactionController.js | head -20"
    )
    print("=== Key lines in deployed controller ===")
    print(stdout.read().decode('utf-8', 'ignore'))

    ssh.close()
except Exception as e:
    print(f"Error: {e}")
