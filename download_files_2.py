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
    ('/home/mayowae/public_html/alphaweb/backend/controllers/collectionController.js', 'collectionController.js'),
    ('/home/mayowae/public_html/alphaweb/backend/controllers/remittanceController.js', 'remittanceController.js'),
    ('/home/mayowae/public_html/alphaweb/backend/controllers/chargeController.js', 'chargeController.js'),
    ('/home/mayowae/public_html/alphaweb/backend/controllers/customerController.js', 'customerController.js'),
    ('/home/mayowae/public_html/alphaweb/backend/controllers/customerWalletController.js', 'customerWalletController.js'),
    ('/home/mayowae/public_html/alphaweb/backend/controllers/loanController.js', 'loanController.js'),
    ('/home/mayowae/public_html/alphaweb/backend/controllers/investmentController.js', 'investmentController.js')
]

os.makedirs('backend_files', exist_ok=True)

for remote, local in files_to_download:
    print(f"Downloading {remote}...")
    sftp.get(remote, os.path.join('backend_files', local))

sftp.close()
client.close()
