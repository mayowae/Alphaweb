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

print("--- finding Server block for alphakolect ---")
# Use awk to print the block containing alphakolect.com
cmd = "nginx -T 2>/dev/null | awk '/server_name.*alphakolect.com/,/}/'"
out, err = run(cmd)
print(out)

client.close()
