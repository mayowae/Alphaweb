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
    
    print("Stopping backend to free up RAM...")
    ssh.exec_command("pm2 stop alphaweb-backend")
    
    print("Running linux-optimized build...")
    cmd = "cd /home/mayowae/public_html/alphaweb && rm -rf .next && npm run build_linux"
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    # Read output
    while not stdout.channel.exit_status_ready():
        if stdout.channel.recv_ready():
            print(stdout.channel.recv(1024).decode('utf-8', errors='ignore'), end='')
        if stderr.channel.recv_ready():
            print(stderr.channel.recv(1024).decode('utf-8', errors='ignore'), end='', file=sys.stderr)
            
    exit_status = stdout.channel.recv_exit_status()
    print(f"\nBuild exit status: {exit_status}")
    
    print("Restarting all services...")
    ssh.exec_command("pm2 start alphaweb-backend")
    ssh.exec_command("pm2 restart alphaweb-frontend")
    
    ssh.close()
    print("Deployment cycle completed.")

except Exception as e:
    print(f"Error: {e}")
