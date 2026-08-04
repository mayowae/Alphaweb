import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)
sftp = client.open_sftp()

files_to_download = [
    ('/home/mayowae/public_html/alphaweb/backend/controllers/investmentTransactionController.js', 'investmentTransactionController.js'),
    ('/home/mayowae/public_html/alphaweb/backend/controllers/investmentApplicationController.js', 'investmentApplicationController.js'),
    ('/home/mayowae/public_html/alphaweb/backend/models/investment.js', 'investment.js'),
    ('/home/mayowae/public_html/alphaweb/backend/models/investmentApplication.js', 'investmentApplication.js'),
    ('/home/mayowae/public_html/alphaweb/backend/models/package.js', 'package.js')
]

os.makedirs('backend_files', exist_ok=True)

for remote, local in files_to_download:
    print(f"Downloading {remote}...")
    sftp.get(remote, os.path.join('backend_files', local))

sftp.close()
client.close()
