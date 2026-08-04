import paramiko
import os

HOSTNAME = '159.198.36.24'
PORT = 22
USERNAME = 'root'
PASSWORD = 'yft1x2X89Z0MZrAvM9'

def download_files():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOSTNAME, port=PORT, username=USERNAME, password=PASSWORD)
    sftp = client.open_sftp()
    
    # 1. Download subscription.js
    remote_sub = '/home/mayowae/public_html/alphaweb/backend/models/subscription.js'
    local_sub = 'C:/Users/trade/Documents/Alphaweb-main/backend/models/subscription.js'
    print(f"Downloading {remote_sub}...")
    sftp.get(remote_sub, local_sub)
    
    # 2. Download index.js
    remote_index = '/home/mayowae/public_html/alphaweb/backend/models/index.js'
    local_index = 'C:/Users/trade/Documents/Alphaweb-main/backend/models/index.js'
    print(f"Downloading {remote_index}...")
    sftp.get(remote_index, local_index)

    # 3. Download merchant.js
    remote_merchant = '/home/mayowae/public_html/alphaweb/backend/models/merchant.js'
    local_merchant = 'C:/Users/trade/Documents/Alphaweb-main/backend/models/merchant.js'
    print(f"Downloading {remote_merchant}...")
    sftp.get(remote_merchant, local_merchant)
    
    # 4. Download merchantManagementController.js
    remote_controller = '/home/mayowae/public_html/alphaweb/backend/controllers/merchantManagementController.js'
    local_controller = 'C:/Users/trade/Documents/Alphaweb-main/backend/controllers/merchantManagementController.js'
    print(f"Downloading {remote_controller}...")
    sftp.get(remote_controller, local_controller)
    
    sftp.close()
    client.close()
    print("Done downloading remote files.")

if __name__ == '__main__':
    download_files()
