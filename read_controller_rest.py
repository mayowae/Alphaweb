import paramiko
import io

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def read_file_range(path, start, end):
    stdin, stdout, stderr = client.exec_command(f"sed -n '{start},{end}p' {path}")
    return stdout.read().decode('utf-8', errors='ignore')

with io.open('transaction_controller_rest.txt', 'w', encoding='utf-8') as f:
    f.write(read_file_range('/home/mayowae/public_html/alphaweb/backend/controllers/investmentTransactionController.js', 801, 1500))

client.close()
