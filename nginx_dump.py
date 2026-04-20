import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=300)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace'), stderr.read().decode('utf-8', errors='replace')

print("--- grepping Nginx config for '3000' and '5001' and '5000' ---")
out, err = run("nginx -T 2>/dev/null | grep -E '3000|5001|5000'")
print(out)

print("--- grepping Nginx config for server_name ---")
out, err = run("nginx -T 2>/dev/null | grep -i 'server_name'")
print(out)

client.close()
