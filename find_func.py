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

content = read_file('/home/mayowae/public_html/alphaweb/backend/controllers/investmentApplicationController.js')

# Find updateApplicationStatus
import re
match = re.search(r'const updateApplicationStatus = async.*?};', content, re.DOTALL)
if match:
    print(match.group(0))
else:
    print("Function not found")

client.close()
