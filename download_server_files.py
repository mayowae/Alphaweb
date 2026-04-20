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

project_dir = "/home/mayowae/public_html/alphaweb"

# Read the customer controller
out, err = run(f"cat {project_dir}/backend/controllers/customerController.js")
with open('server_customer_controller.js', 'w', encoding='utf-8') as f:
    f.write(out)

# Read the customer model
out, err = run(f"cat {project_dir}/backend/models/customer.js")
with open('server_customer_model.js', 'w', encoding='utf-8') as f:
    f.write(out)

# Read the models/index.js
out, err = run(f"cat {project_dir}/backend/models/index.js")
with open('server_models_index.js', 'w', encoding='utf-8') as f:
    f.write(out)

client.close()
print("Downloaded server files for analysis")
