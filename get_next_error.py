import paramiko
import time

def deploy():
    hostname = '159.198.36.24'
    port = 22
    username = 'root'
    password = '96eUC4aTbMu1o3yAP2'

    remote_root = '/home/mayowae/public_html/alphaweb'
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port=port, username=username, password=password)
    
    print("Starting frontend build remotely...")
    stdin, stdout, stderr = ssh.exec_command(f"cd {remote_root} && export NODE_OPTIONS=--max-old-space-size=4096 && npm run build")
    exit_status = stdout.channel.recv_exit_status()
    
    out = stdout.read()
    err = stderr.read()
    
    with open('build_error_dump.log', 'wb') as f:
        f.write(out)
        f.write(err)

    if exit_status == 0:
        print("Build succeeded!")
        ssh.exec_command(f"cd {remote_root} && pm2 restart alphaweb-frontend || pm2 start npm --name 'alphaweb-frontend' -- start")
        ssh.exec_command(f"cd {remote_root} && pm2 restart next || true")
    else:
        print("Build failed. Log saved to build_error_dump.log")

    ssh.close()
    
if __name__ == "__main__":
    deploy()
