import paramiko
import sys

def execute_remote_commands(hostname, port, username, password, commands):
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, port=port, username=username, password=password, timeout=20)
        
        results = []
        for cmd in commands:
            print(f"Running: {cmd}")
            stdin, stdout, stderr = ssh.exec_command(cmd)
            out = stdout.read().decode()
            err = stderr.read().decode()
            results.append(f"COMMAND: {cmd}\nSTDOUT:\n{out}\nSTDERR:\n{err}\n{'-'*40}\n")
        
        ssh.close()
        return "".join(results)
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    hostname = '159.198.36.24'
    port = 22
    username = 'root'
    password = '96eUC4aTbMu1o3yAP2'
    
    cmds = [
        "hostname",
        "ip addr show eth0",
        "systemctl status nginx --no-pager",
        "nginx -T",
        "pm2 list",
        "netstat -tulnp",
        "ls -la /var/www/alphakolect.com || ls -la /var/www/html",
        "cat /etc/nginx/sites-enabled/default || cat /etc/nginx/nginx.conf"
    ]
    
    output = execute_remote_commands(hostname, port, username, password, cmds)
    with open("vps_diag.txt", "w", encoding="utf-8") as f:
        f.write(output)
    print("Diagnostics saved to vps_diag.txt")
