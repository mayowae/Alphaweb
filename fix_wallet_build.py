import paramiko
import time

def deploy():
    hostname = '159.198.36.24'
    port = 22
    username = 'root'
    password = '96eUC4aTbMu1o3yAP2'

    remote_root = '/home/mayowae/public_html/alphaweb'
    remote_page = f"{remote_root}/src/app/dashboard/(pages)/wallet/page.tsx"
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port=port, username=username, password=password)
    
    print("Fixing wallet page remotely...")
    stdin, stdout, stderr = ssh.exec_command(f"sed -i \"s/paymentMethod: 'Cash'//g\" {remote_page}")
    stdin, stdout, stderr = ssh.exec_command(f"sed -i \"s/,  }/ }/g\" {remote_page}")
    stdin, stdout, stderr = ssh.exec_command(f"sed -i \"s/, }/ }/g\" {remote_page}")

    print("Restarting build...")
    stdin, stdout, stderr = ssh.exec_command(f"cd {remote_root} && export NODE_OPTIONS=--max-old-space-size=4096 && npm run build")
    exit_status = stdout.channel.recv_exit_status()
    
    if exit_status == 0:
        print("Build succeeded, starting frontend...")
        ssh.exec_command(f"cd {remote_root} && pm2 restart alphaweb-frontend || pm2 start npm --name 'alphaweb-frontend' -- start")
        ssh.exec_command(f"cd {remote_root} && pm2 restart next || true")
    else:
        print("Build failed.")
        print(stderr.read().decode('utf-8', errors='ignore'))
        print(stdout.read().decode('utf-8', errors='ignore'))

    ssh.close()
    print("Completed!")

if __name__ == "__main__":
    deploy()
