import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace')

print("=== Finding merchant_routes.js ===")
out = run("find /home/mayowae/public_html/alphaweb/ -name \"merchant_routes.js\"")
print(out)

# Find controllers too
controllers_out = run("find /home/mayowae/public_html/alphaweb/ -name \"merchantController.js\"")
print("Controllers found:", controllers_out)

client.close()
