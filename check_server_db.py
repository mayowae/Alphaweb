import paramiko
import json

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

# Find the project directory
out, err = run("ls -d /root/alphaweb /home/mayowae/public_html/alphaweb 2>/dev/null")
project_dir = out.strip().split('\n')[0]
print(f"Project directory: {project_dir}")

# Check customer model on server
out, err = run(f"cat {project_dir}/backend/models/customer.js")
print("Customer Model on Server:")
print(out)

# Check customer controller on server
out, err = run(f"cat {project_dir}/backend/controllers/customerController.js")
print("Customer Controller on Server:")
# Only print the listCustomers part
lines = out.split('\n')
for i, line in enumerate(lines):
    if 'const listCustomers' in line:
        print('\n'.join(lines[i:i+60]))
        break

# Check package data in database
# Assuming postgres is used based on models/index.js
# I'll try to find the .env to get DB credentials on server
out, err = run(f"cat {project_dir}/backend/.env")
print("\nBackend .env on Server:")
# Mask the password
env_lines = out.split('\n')
for line in env_lines:
    if 'DB_' in line or 'DATABASE_URL' in line:
        if 'PASSWORD' in line:
            print(line.split('=')[0] + '=********')
        else:
            print(line)

client.close()
