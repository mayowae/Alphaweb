import paramiko
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port, username, password)
    
    print("Running npm build and capturing errors...")
    stdin, stdout, stderr = ssh.exec_command("cd /home/mayowae/public_html/alphaweb && npm run build")
    
    # Wait for completion
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    
    print("STDOUT:")
    print(out[-3000:]) 
    print("\nSTDERR:")
    print(err)
    
    ssh.close()
except Exception as e:
    print(f"Error: {e}")
