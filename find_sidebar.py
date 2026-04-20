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

print("--- finding Sidebar files ---")
out, err = run("find /home/mayowae/public_html/alphaweb/src -name 'Sidebar.*'")
print(out)

print("--- finding layout files in dashboard ---")
out, err = run("find /home/mayowae/public_html/alphaweb/src/app/dashboard -name 'layout.*'")
print(out)

client.close()
