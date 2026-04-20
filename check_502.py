import paramiko
import sys

# Ensure utf-8 output to avoid Windows console errors
sys.stdout.reconfigure(encoding='utf-8')

def check():
    hostname = '159.198.36.24'
    port = 22
    username = 'root'
    password = '96eUC4aTbMu1o3yAP2'
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port=port, username=username, password=password)
    
    print("--- PM2 Status ---")
    stdin, stdout, stderr = ssh.exec_command("pm2 list | grep -i err -v")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    print("--- Process listening on 3000 ---")
    stdin, stdout, stderr = ssh.exec_command("netstat -tulpn | grep 3000")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    print("--- PM2 Logs (Backend) ---")
    stdin, stdout, stderr = ssh.exec_command("pm2 logs alphaweb-backend --nostream --lines 20")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
    print("--- Next JS Frontend Logs ---")
    stdin, stdout, stderr = ssh.exec_command("cat /home/mayowae/public_html/alphaweb/build_collections.log | tail -n 20")
    print(stdout.read().decode('utf-8', errors='ignore'))
    
check()
