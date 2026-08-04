import paramiko
import io

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def read_file(path):
    stdin, stdout, stderr = client.exec_command(f'cat {path}')
    return stdout.read().decode('utf-8', errors='ignore')

with io.open('collection_charge_logic.txt', 'w', encoding='utf-8') as f:
    f.write("=== COLLECTION CONTROLLER ===\n")
    f.write(read_file('/home/mayowae/public_html/alphaweb/backend/controllers/collectionController.js'))
    f.write("\n\n=== CHARGE CONTROLLER ===\n")
    f.write(read_file('/home/mayowae/public_html/alphaweb/backend/controllers/chargeController.js'))

client.close()
