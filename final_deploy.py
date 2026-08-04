import paramiko
import os
import sys

# Ensure stdout handles UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

hostname = '159.198.36.24'
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

local_tar = r'c:\Users\trade\Documents\Alphaweb-main\alphaweb_update.tar.gz'
remote_dir = '/home/mayowae/public_html/alphaweb'
# Use posix-style join for remote paths
remote_tar = remote_dir + '/alphaweb_update.tar.gz'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    print(f"Connecting to {hostname}...")
    client.connect(hostname, username=username, password=password, timeout=60)
    print("Connected!")

    # 1. Upload the tarball
    sftp = client.open_sftp()
    print(f"Uploading {local_tar}...")
    sftp.put(local_tar, remote_tar)
    sftp.close()
    print("Upload complete")

    def run(cmd):
        print(f"\nRunning: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd)
        # Use errors='replace' and handle printing carefully
        out = stdout.read().decode('utf-8', errors='replace')
        err = stderr.read().decode('utf-8', errors='replace')
        
        # Filter out characters that might break Windows console if not reconfigured
        try:
            if out: sys.stdout.write(out + "\n")
            if err: sys.stdout.write("ERR: " + err + "\n")
        except UnicodeEncodeError:
            if out: sys.stdout.write(out.encode('ascii', 'replace').decode() + "\n")
            if err: sys.stdout.write("ERR: " + err.encode('ascii', 'replace').decode() + "\n")
            
        return out, err

    # 2. Extract and Cleanup
    run(f"cd {remote_dir} && tar -xzf alphaweb_update.tar.gz")
    run(f"rm {remote_tar}")
    print("Extraction complete")

    # 3. Handle Backend
    print("\n--- Handling Backend ---")
    run(f"cd {remote_dir}/backend && npm install --omit=dev")
    run("pm2 restart alphaweb-backend || (cd /home/mayowae/public_html/alphaweb/backend && pm2 start server.js --name alphaweb-backend)")

    # 4. Handle Frontend
    print("\n--- Handling Frontend ---")
    run(f"cd {remote_dir} && npm install")
    print("Starting Frontend Build (this may take a few minutes)...")
    run(f"cd {remote_dir} && env NODE_OPTIONS='--max-old-space-size=1536' npm run build")
    
    print("Restarting Frontend...")
    run("pm2 restart alphaweb-frontend || (cd /home/mayowae/public_html/alphaweb && pm2 start npm --name alphaweb-frontend -- start)")

    client.close()
    print("\nDEPLOYMENT SUCCESSFUL!")

except Exception as e:
    print(f"\nDEPLOYMENT FAILED: {e}")
