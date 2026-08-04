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

with io.open('backend_logic_utf8.txt', 'w', encoding='utf-8') as f:
    f.write("=== PACKAGE MODEL ===\n")
    f.write(read_file('/home/mayowae/public_html/alphaweb/backend/models/package.js'))
    f.write("\n\n=== INVESTMENT APPLICATION MODEL ===\n")
    f.write(read_file('/home/mayowae/public_html/alphaweb/backend/models/investmentApplication.js'))
    f.write("\n\n=== INVESTMENT TRANSACTION CONTROLLER ===\n")
    f.write(read_file('/home/mayowae/public_html/alphaweb/backend/controllers/investmentTransactionController.js'))

client.close()
