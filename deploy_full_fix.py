import paramiko
import os

def deploy_all(hostname, port, username, password):
    local_root = r'C:\Users\trade\Documents\Alphaweb-main'
    remote_root = '/home/mayowae/public_html/alphaweb'
    
    files_to_upload = [
        r'src\components\SingleCollectionForm.tsx',
        r'src\components\BulkCollectionForm.tsx',
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
            remote_dir = os.path.dirname(remote_path)
            ssh.exec_command(f"mkdir -p {remote_dir}")
            sftp.put(local_path, remote_path)
            print("Upload successful.")
        except Exception as e:
            print(f"Failed to upload {rel_path}: {e}")
            
    sftp.close()
    
    print("Restarting all processes...")
    ssh.exec_command("pm2 restart all")
    
    # Force frontend restart if dev mode
    commands = [
        "pkill -9 -f node || true",
        "pkill -9 -f next || true",
        "fuser -k 3000/tcp || true",
        f"cd {remote_root} && (nohup env NODE_OPTIONS='--max-old-space-size=2048' npm run dev > dev.log 2>&1 &)"
    ]
    for cmd in commands:
        ssh.exec_command(cmd)
        
    ssh.close()
    print("Full Deployment complete.")

if __name__ == "__main__":
    hostname = '159.198.36.24'
    port = 22
    username = 'root'
    password = '96eUC4aTbMu1o3yAP2'
    deploy_all(hostname, port, username, password)
