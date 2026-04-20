import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

# Save the favicon locally first
# The image is provided in the turn as an attachment. 
# I will use the image path from the environment.
# Wait, I don't have the image path directly in the script but I can use the image provided in the turn.
# I'll manually upload it using sftp.put if I had it.
# Actually, I'll use the 'upload' action of sync.py once I have the file locally.

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd, cwd=None):
    if cwd:
        cmd = f"cd {cwd} && {cmd}"
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace'), stderr.read().decode('utf-8', errors='replace')

# 1. Update layout.tsx with the favicon link
print("--- Updating layout.tsx with favicon ---")
# I'll do this locally first and then upload.

client.close()
