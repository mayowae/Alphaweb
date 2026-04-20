import paramiko
import time
import sys

sys.stdout.reconfigure(encoding='utf-8')

def deploy():
    hostname = '159.198.36.24'
    port = 22
    username = 'root'
    password = '96eUC4aTbMu1o3yAP2'

    remote_root = '/home/mayowae/public_html/alphaweb'
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port=port, username=username, password=password)
    
    print("Starting frontend build retries...")
    max_retries = 3
    for i in range(max_retries):
        print(f"Build attempt {i+1}...")
        stdin, stdout, stderr = ssh.exec_command(f"cd {remote_root} && export NODE_OPTIONS=--max-old-space-size=4096 && npm run build")
        exit_status = stdout.channel.recv_exit_status()
        
        if exit_status == 0:
            print("Build succeeded, starting frontend...")
            ssh.exec_command(f"cd {remote_root} && pm2 restart alphaweb-frontend || pm2 start npm --name 'alphaweb-frontend' -- start")
            ssh.exec_command(f"cd {remote_root} && pm2 restart next || true")
            break
        else:
            print(f"Build attempt {i+1} failed.")
            print(stderr.read().decode('utf-8', errors='ignore'))
            if i == max_retries - 1:
                print("All retries failed:")
                print(stdout.read().decode('utf-8', errors='ignore'))
    ssh.close()
    print("Completed!")

if __name__ == "__main__":
    deploy()
