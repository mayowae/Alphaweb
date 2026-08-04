import paramiko

# Credentials
hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

def run_remote_command(ssh, command):
    print(f"Running: {command}")
    stdin, stdout, stderr = ssh.exec_command(command)
    # Don't print output to avoid encoding issues
    stdout.read()
    stderr.read()

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port, username, password, timeout=30)
    print("Connected!")

    print("Building frontend (this will take time)...")
    run_remote_command(ssh, "cd /home/mayowae/public_html/alphaweb && npm run build")
    print("Build finished!")

    print("Restarting frontend...")
    run_remote_command(ssh, "pm2 restart alphaweb-frontend")
    print("Frontend restarted!")

    ssh.close()
    print("Done!")
except Exception as e:
    print(f"Error: {e}")
