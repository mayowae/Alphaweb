import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def read_file(path):
    stdin, stdout, stderr = client.exec_command(f'cat {path}')
    return stdout.read().decode('utf-8')

print("=== PACKAGE MODEL ===")
print(read_file('/home/mayowae/public_html/alphaweb/backend/models/package.js'))

print("\n=== INVESTMENT APPLICATION MODEL ===")
print(read_file('/home/mayowae/public_html/alphaweb/backend/models/investmentApplication.js'))

print("\n=== INVESTMENT TRANSACTION CONTROLLER ===")
print(read_file('/home/mayowae/public_html/alphaweb/backend/controllers/investmentTransactionController.js'))

client.close()
