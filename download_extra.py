import paramiko
import os

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('159.198.36.24', 22, 'root', '96eUC4aTbMu1o3yAP2')
sftp = client.open_sftp()

files = [
    '/home/mayowae/public_html/alphaweb/backend/controllers/repaymentController.js',
    '/home/mayowae/public_html/alphaweb/backend/controllers/loanTransactionController.js'
]

for f in files:
    try:
        sftp.get(f, os.path.join('backend_files', os.path.basename(f)))
        print(f"Downloaded {f}")
    except:
        print(f"Could not find {f}")

sftp.close()
client.close()
