import paramiko
import time

def deploy():
    hostname = '159.198.36.24'
    port = 22
    username = 'root'
    password = '96eUC4aTbMu1o3yAP2'

    local_root = r'C:\Users\trade\Documents\Alphaweb-main'
    remote_root = '/home/mayowae/public_html/alphaweb'
    
    files_to_upload = [
        r'src\components\BulkCollectionForm.tsx',
        r'src\components\SingleCollectionForm.tsx'
    ]
    
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port=port, username=username, password=password)
    sftp = ssh.open_sftp()
    
    for rel_path in files_to_upload:
        local_path = local_root + '\\' + rel_path
        remote_path = remote_root + '/' + rel_path.replace('\\', '/')
        print(f"Uploading {local_path} to {remote_path}...")
        sftp.put(local_path, remote_path)
    sftp.close()
    
    print("Starting frontend build...")
    stdin, stdout, stderr = ssh.exec_command(f"cd {remote_root} && export NODE_OPTIONS=--max-old-space-size=4096 && npm run build")
    
    # Wait for build to finish
    exit_status = stdout.channel.recv_exit_status()
    if exit_status == 0:
        print("Build succeeded, starting frontend...")
        # Start Next.js using pm2 if it's down, or restart it
        # Try finding the process
        ssh.exec_command(f"cd {remote_root} && pm2 restart alphaweb-frontend || pm2 start npm --name 'alphaweb-frontend' -- start")
        # Ensure it works even if named differently
        ssh.exec_command(f"cd {remote_root} && pm2 restart next || true")
    else:
        print("Build failed.")
        print(stderr.read().decode())
        print(stdout.read().decode())

    ssh.close()
    print("Deployment complete!")

if __name__ == "__main__":
    deploy()
