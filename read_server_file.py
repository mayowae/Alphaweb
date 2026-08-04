import paramiko

# Credentials
hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port, username, password, timeout=30)
    
    stdin, stdout, stderr = ssh.exec_command('cat /home/mayowae/public_html/alphaweb/backend/models/investment.js')
    content = stdout.read().decode('utf-8', 'ignore')
    print(content)
    
    ssh.close()
except Exception as e:
    print(f"Error: {e}")
