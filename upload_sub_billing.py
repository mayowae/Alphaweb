import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

files_to_upload = [
    (
        "C:\\Users\\trade\\Documents\\Alphaweb-main\\local_edit\\subscriptions_billings.tsx",
        "/home/mayowae/public_html/alphaweb/components/tables/merchants/merchantdetailstabs/Subscriptions&Billings.tsx"
    )
]

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)
sftp = client.open_sftp()

for local, remote in files_to_upload:
    print(f"Uploading {local} to {remote}...")
    sftp.put(local, remote)
    print("Done.")

sftp.close()
client.close()
