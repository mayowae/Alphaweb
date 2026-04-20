import paramiko
import sys
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(hostname, port=port, username=username, password=password, timeout=30)
except Exception as e:
    print(f"Error connecting: {e}")
    sys.exit(1)

action = sys.argv[1]
remote_path = sys.argv[2]
local_path = sys.argv[3]

sftp = client.open_sftp()
try:
    if action == 'download':
        sftp.get(remote_path, local_path)
        print(f"Downloaded {remote_path} to {local_path}")
    elif action == 'upload':
        sftp.put(local_path, remote_path)
        print(f"Uploaded {local_path} to {remote_path}")
    else:
        print("Invalid action. Use 'download' or 'upload'.")
except Exception as e:
    print(f"Error during {action}: {e}")
finally:
    sftp.close()
    client.close()
