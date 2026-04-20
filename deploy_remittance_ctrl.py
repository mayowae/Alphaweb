import paramiko
import os

def deploy():
    hostname = '159.198.36.24'
    port = 22
    username = 'root'
    password = '96eUC4aTbMu1o3yAP2'

    local_root = r'C:\Users\trade\Documents\Alphaweb-main'
    remote_root = '/home/mayowae/public_html/alphaweb'
    
    files_to_upload = [
        r'backend\controllers\remittanceController.js'
    ]
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port=port, username=username, password=password)
    
    sftp = ssh.open_sftp()
    
    for rel_path in files_to_upload:
        local_path = os.path.join(local_root, rel_path)
        remote_path = remote_root + '/' + rel_path.replace('\\', '/')
        print(f"Uploading {local_path} to {remote_path}...")
        sftp.put(local_path, remote_path)
        
    sftp.close()
    
    print("Restarting backend...")
    ssh.exec_command(f"pm2 restart alphaweb-backend")
    
    ssh.close()
    print("Deployment complete!")

if __name__ == "__main__":
    deploy()
