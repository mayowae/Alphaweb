import paramiko
import sys

def check_server(hostname, port, username, password):
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, port=port, username=username, password=password, timeout=10)
        
        commands = [
            "echo '--- IP Addr ---'; ip addr show | grep 'inet '",
            "echo '--- Nginx Status ---'; systemctl status nginx --no-pager || echo 'Nginx not found'",
            "echo '--- PM2 Status ---'; pm2 list || echo 'PM2 not found'",
            "echo '--- Listening Ports ---'; netstat -tuln | grep -E ':80|:443|:3000|:8000|:8080|:5173'",
            "echo '--- Nginx Configs ---'; ls /etc/nginx/sites-enabled/",
            "echo '--- App Directory ---'; ls -d /var/www/*/ || echo 'No /var/www/ directories'",
            "echo '--- Hostname ---'; hostname"
        ]
        
        for cmd in commands:
            print(f"\nExecuting: {cmd}")
            stdin, stdout, stderr = ssh.exec_command(cmd)
            print(stdout.read().decode())
            err = stderr.read().decode()
            if err:
                print(f"Error: {err}")
        
        ssh.close()
    except Exception as e:
        print(f"Failed to connect or execute: {e}")

if __name__ == "__main__":
    hostname = '159.198.36.24'
    port = 22
    username = 'root'
    password = '96eUC4aTbMu1o3yAP2'
    check_server(hostname, port, username, password)
