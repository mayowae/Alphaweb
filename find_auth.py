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
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

print("=== Search for merchantProfile fetching ===")
out, err = run("grep -rn \"/api/merchant/profile\" /home/mayowae/public_html/alphaweb/ | head -n 30")
print(out)

print("=== Search for AuthProvider ===")
out, err = run("grep -rn \"AuthProvider\" /home/mayowae/public_html/alphaweb/ | head -n 10")
print(out)

client.close()
