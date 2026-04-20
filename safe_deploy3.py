import paramiko
import os
import time

def safe_deploy():
    hostname = '159.198.36.24'
    port = 22
    username = 'root'
    password = '96eUC4aTbMu1o3yAP2'
    
    local_root = r'C:\Users\trade\Documents\Alphaweb-main'
    remote_root = '/home/mayowae/public_html/alphaweb'
    
    files_to_upload = [
        r'services\api.tsx',
        r'src\app\dashboard\(pages)\collection\(pages)\collections\page.tsx'
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
            sftp.put(local_path, remote_path)
            print("Upload successful.")
        except Exception as e:
            print(f"Failed to upload {rel_path}: {e}")
            
    sftp.close()
    
    # Safe restart script
    print("Safely terminating current Next.js...")
    ssh.exec_command("fuser -k 3000/tcp || true")
    ssh.exec_command("pkill -9 -f next || true")
    ssh.exec_command("pkill -9 -f node || true")
    time.sleep(3)
    
    print("Starting Next.js on port 3000...")
    cmd = f"cd {remote_root} && rm -f dev.log && (nohup env NODE_OPTIONS='--max-old-space-size=2048' npm run dev -- -p 3000 > dev.log 2>&1 &)"
    ssh.exec_command(cmd)
    
    time.sleep(10)
    print("Deployment finished.")
    ssh.close()

if __name__ == "__main__":
    safe_deploy()
