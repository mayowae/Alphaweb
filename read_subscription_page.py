import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

cmd = 'cat "/home/mayowae/public_html/alphaweb/src/app/dashboard/(pages)/subscription/page.tsx"'
stdin, stdout, stderr = client.exec_command(cmd)

print("--- Subscription Page Source ---")
print(stdout.read().decode('utf-8', errors='replace'))

client.close()
