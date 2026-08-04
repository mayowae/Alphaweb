import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

files_to_upload = [
    ("backend/utils/doubleEntry.js", "/home/mayowae/public_html/alphaweb/backend/utils/doubleEntry.js"),
    ("live_remittanceController.js", "/home/mayowae/public_html/alphaweb/backend/controllers/remittanceController.js"),
    ("live_repaymentController.js", "/home/mayowae/public_html/alphaweb/backend/controllers/repaymentController.js"),
    ("live_loanController.js", "/home/mayowae/public_html/alphaweb/backend/controllers/loanController.js"),
    ("live_walletController.js", "/home/mayowae/public_html/alphaweb/backend/controllers/walletController.js"),
    ("live_investmentTransactionController.js", "/home/mayowae/public_html/alphaweb/backend/controllers/investmentTransactionController.js"),
    ("live_accountingController.js", "/home/mayowae/public_html/alphaweb/backend/controllers/accountingController.js")
]

print("Connecting to live VPS via SSH/SFTP...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)
sftp = client.open_sftp()

# Ensure backend/utils directory exists
print("Ensuring backend/utils directory exists on server...")
try:
    sftp.mkdir("/home/mayowae/public_html/alphaweb/backend/utils")
    print("Created backend/utils directory.")
except IOError:
    # Directory already exists
    print("backend/utils directory already exists.")

for local, remote in files_to_upload:
    print(f"Uploading local {local} to remote {remote}...")
    sftp.put(local, remote)
    print("Uploaded successfully.")

sftp.close()
client.close()
print("All files synchronized successfully to the live server!")
