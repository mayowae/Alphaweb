import paramiko
import os

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('159.198.36.24', 22, 'root', '96eUC4aTbMu1o3yAP2')
sftp = client.open_sftp()

mappings = [
    ('src/app/dashboard/customer/[id]/page.tsx', '/home/mayowae/public_html/alphaweb/src/app/dashboard/customer/[id]/page.tsx'),
    ('src/app/dashboard/(pages)/staffManagement/page.tsx', '/home/mayowae/public_html/alphaweb/src/app/dashboard/(pages)/staffManagement/page.tsx')
]

for local, remote in mappings:
    if os.path.exists(local):
        print(f"Uploading {local} to {remote}...")
        sftp.put(local, remote)
    else:
        print(f"Warning: {local} not found locally.")

sftp.close()

client.close()
print("Done.")
