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

print("--- find filenames with alphakolect.com in /etc/nginx ---")
out, err = run("grep -rl 'alphakolect.com' /etc/nginx")
print(out)

# For each file, print its content
files = out.strip().split('\n')
for f in files:
    if f:
        print(f"--- CONTENT OF {f} ---")
        out, err = run(f"cat {f}")
        print(out)

client.close()
