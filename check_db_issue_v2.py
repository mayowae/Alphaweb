import paramiko
import sys

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='ignore'), stderr.read().decode('utf-8', errors='ignore')

print("--- models/index.js (Lines 1-60) ---")
out, err = run("sed -n '1,60p' /home/mayowae/public_html/alphaweb/backend/models/index.js")
print(out)

print("--- .env file ---")
out, err = run("cat /home/mayowae/public_html/alphaweb/backend/.env")
print(out)

client.close()
