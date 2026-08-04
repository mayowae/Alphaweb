import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port, username, password, timeout=30)
    
    # Find the DB connection details from .env
    stdin, stdout, stderr = ssh.exec_command('cat /home/mayowae/public_html/alphaweb/backend/.env')
    print("=== .env ===")
    print(stdout.read().decode('utf-8', 'ignore'))
    
    # Check investment application model status field
    stdin, stdout, stderr = ssh.exec_command('cat /home/mayowae/public_html/alphaweb/backend/models/investmentApplication.js')
    print("=== investmentApplication.js ===")
    content = stdout.read().decode('utf-8', 'ignore')
    # Only print the status field area
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'status' in line.lower() or 'enum' in line.lower():
            print(f"{i}: {line}")

    ssh.close()
except Exception as e:
    print(f"Error: {e}")
