import paramiko
import time

def fix_502():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('159.198.36.24', port=22, username='root', password='96eUC4aTbMu1o3yAP2')
    
    print("Killing existing node/next processes and clearing port 3000...")
    ssh.exec_command('fuser -k 3000/tcp')
    ssh.exec_command('pkill -9 -f next')
    ssh.exec_command('pkill -9 -f node')
    
    time.sleep(3)
    
    print("Restarting backend just in case...")
    ssh.exec_command('pm2 restart all')
    
    print("Starting Next.js specifically on port 3000...")
    cmd = "cd /home/mayowae/public_html/alphaweb && rm -f dev.log && (nohup env NODE_OPTIONS='--max-old-space-size=1536' npm run dev -- -p 3000 > dev.log 2>&1 &)"
    ssh.exec_command(cmd)
    
    time.sleep(5)
    
    print("Fetching server start logs...")
    stdin, stdout, stderr = ssh.exec_command('cat /home/mayowae/public_html/alphaweb/dev.log')
    print(stdout.read().decode('utf-8', errors='replace'))
    
    ssh.close()
    print("Fix script completed.")

if __name__ == "__main__":
    fix_502()
