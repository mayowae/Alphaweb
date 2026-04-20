import paramiko
import json

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port, username, password)
    
    # Read package.json
    sftp = ssh.open_sftp()
    with sftp.open('/home/mayowae/public_html/alphaweb/package.json', 'r') as f:
        data = json.load(f)
    
    # Fix scripts for Linux and lower RAM limits
    if 'scripts' in data:
        for key in ['dev', 'build']:
            if key in data['scripts']:
                # Remove the windows 'set' style and '&&'
                # Just use 'next build' and let us pass NODE_OPTIONS externally if needed
                # OR set it properly for linux
                data['scripts'][key] = "next " + key
        # Add a linux-friendly build script with safe RAM limit if they want
        data['scripts']['build_linux'] = "NODE_OPTIONS=--max-old-space-size=1024 next build"
    
    # Save back
    with sftp.open('/home/mayowae/public_html/alphaweb/package.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    sftp.close()
    ssh.close()
    print("package.json updated successfully.")

except Exception as e:
    print(f"Error: {e}")
