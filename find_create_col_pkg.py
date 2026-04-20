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

print("=== grep 'Type' frontend ===")
print(run("grep -rn -i 'type' /home/mayowae/public_html/alphaweb/src/app | top -20 2>/dev/null || head -20"))

print("=== grep 'Collection Package' frontend ===")
print(run("grep -rn -i 'Collection Package' /home/mayowae/public_html/alphaweb/src/app | head -20"))

print("=== grep 'Fixed' frontend package ===")
print(run("grep -rn -i 'Fixed' /home/mayowae/public_html/alphaweb/src/app/dashboard | head -20"))

print("=== grep 'Package' in models ===")
print(run("cat /home/mayowae/public_html/alphaweb/backend/models/index.js /home/mayowae/public_html/alphaweb/backend/models/Package.js 2>/dev/null | head -50"))

client.close()
