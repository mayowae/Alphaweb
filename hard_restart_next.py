import paramiko
import time

def hard_kill_and_start():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('159.198.36.24', port=22, username='root', password='96eUC4aTbMu1o3yAP2')
    
    commands = [
        # Find and kill ANY process on port 3000
        "fuser -k 3000/tcp || true",
        "netstat -nlp | grep :3000 | awk '{print $7}' | cut -d/ -f1 | xargs -r kill -9",
        "pkill -9 -f node || true",
        "pkill -9 -f next || true",
    ]
    
    with open('server_fix.txt', 'w', encoding='utf-8') as f:
        f.write("=== Killing existing processes ===\n")
        for cmd in commands:
            ssh.exec_command(cmd)
            time.sleep(1) # wait for process to die
            
        time.sleep(3)
        
        # Verify port is free
        stdin, stdout, stderr = ssh.exec_command("netstat -tulpn | grep 3000")
        f.write("=== Port 3000 Status Before Start ===\n")
        out = stdout.read().decode('utf-8', errors='replace')
        f.write(out if out else "Port is FREE\n")
        
        f.write("=== Starting Next.js ===\n")
        start_cmd = "cd /home/mayowae/public_html/alphaweb && rm -f dev.log && (nohup env NODE_OPTIONS='--max-old-space-size=2048' npm run dev > dev.log 2>&1 &)"
        ssh.exec_command(start_cmd)
        
        time.sleep(10) # wait for next to initialize
        
        # Verify port after start
        stdin, stdout, stderr = ssh.exec_command("netstat -tulpn | grep 3000")
        f.write("=== Port 3000 Status After Start ===\n")
        out = stdout.read().decode('utf-8', errors='replace')
        f.write(out if out else "Port is NOT IN USE\n")
        
        # Read final logs
        stdin, stdout, stderr = ssh.exec_command("cat /home/mayowae/public_html/alphaweb/dev.log")
        f.write("=== DEV.LOG ===\n")
        f.write(stdout.read().decode('utf-8', errors='replace'))
        
    ssh.close()
    print("Restart process completed.")

if __name__ == "__main__":
    hard_kill_and_start()
