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
    return stdout.read().decode('utf-8', errors='replace'), stderr.read().decode('utf-8', errors='replace')

print("--- searching for restriction logic in App ---")
out, err = run("grep -rnE 'blocked|suspended|owing|debt' /home/mayowae/public_html/alphaweb/src/app 2>/dev/null | head -50")
print(out)

print("--- searching for restriction logic in Backend ---")
out, err = run("grep -rnE 'blocked|suspended|owing|debt' /home/mayowae/public_html/alphaweb/backend 2>/dev/null | head -50")
print(out)

client.close()
