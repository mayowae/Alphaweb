import paramiko
import os

def upload_and_build(hostname, port, username, password):
    local_root = r'c:\Users\trade\Documents\Alphaweb-main'
    remote_root = '/root/Alphaweb-main'
    
    files_to_upload = [
        r'src\app\dashboard\(pages)\package\(pages)\loan\page.tsx',
        r'src\app\dashboard\(pages)\package\(pages)\loan\Editloan.tsx',
        r'src\app\dashboard\(pages)\package\(pages)\investment\page.tsx',
        r'src\app\dashboard\(pages)\package\(pages)\investment\Editinvestment.tsx',
        r'src\app\dashboard\(pages)\package\(pages)\collection\page.tsx',
        r'src\app\dashboard\(pages)\customer\page.tsx',
        r'components\dashboard\Header.tsx',
        r'services\api.tsx'
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
    
    print("Running npm build and restarting PM2 on the server...")
    commands = [
        f"cd {remote_root} && npm run build",
        "pm2 restart all || /usr/bin/pm2 restart all || echo 'PM2 not restarted'"
    ]
    
    for cmd in commands:
        print(f"\nExecuting: {cmd}")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        
        # Read output in real-time or just print it later
        # Build can take a while, so let's use stdout.channel.recv_exit_status()
        while not stdout.channel.exit_status_ready():
            if stdout.channel.recv_ready():
                print(stdout.channel.recv(1024).decode(), end='')
            if stderr.channel.recv_ready():
                print(stderr.channel.recv(1024).decode(), end='')
        
        print(stdout.read().decode())
        print(stderr.read().decode())
        
    ssh.close()

if __name__ == "__main__":
    hostname = '159.198.36.24'
    port = 22
    username = 'root'
    password = '96eUC4aTbMu1o3yAP2'
    upload_and_build(hostname, port, username, password)
