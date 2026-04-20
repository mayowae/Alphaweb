import paramiko
import os

def deploy_backend_fix(hostname, port, username, password):
    local_root = r'C:\Users\trade\Documents\Alphaweb-main'
    remote_root = '/home/mayowae/public_html/alphaweb' # Based on PM2 CWD
    
    files_to_upload = [
        r'backend\controllers\customerController.js'
    ]
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port=port, username=username, password=password)
    
    sftp = ssh.open_sftp()
    
    for rel_path in files_to_upload:
        local_path = os.path.join(local_root, rel_path)
        remote_path = remote_root + '/' + rel_path.replace('\\', '/')
        
        print(f"Uploading {local_path} to {remote_path}...")
        try:
            # Ensure remote directory exists
            remote_dir = os.path.dirname(remote_path)
            ssh.exec_command(f"mkdir -p {remote_dir}")
            
            sftp.put(local_path, remote_path)
            print("Upload successful.")
        except Exception as e:
            print(f"Failed to upload {rel_path}: {e}")
            
    sftp.close()
    
    print("Restarting backend PM2 process...")
    ssh.exec_command("pm2 restart alphaweb-backend")
    
    ssh.close()
    print("Backend Deployment complete.")

if __name__ == "__main__":
    hostname = '159.198.36.24'
    port = 22
    username = 'root'
    password = '96eUC4aTbMu1o3yAP2'
    deploy_backend_fix(hostname, port, username, password)
