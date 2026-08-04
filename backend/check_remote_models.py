import paramiko

HOSTNAME = '159.198.36.24'
PORT = 22
USERNAME = 'root'
PASSWORD = 'yft1x2X89Z0MZrAvM9'

def run_ssh_cmd(cmd):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOSTNAME, port=PORT, username=USERNAME, password=PASSWORD)
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    client.close()
    return out, err

print("=== Models in Remote VPS ===")
out, err = run_ssh_cmd("ls -la /home/mayowae/public_html/alphaweb/backend/models/")
print(out)
