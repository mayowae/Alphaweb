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

print("=== Checking file contents safely ===")
# List directory first to make sure file exists and has size
out, err = run("ls -l /home/mayowae/public_html/alphaweb/src/app/dashboard/\(pages\)/collection/")
print(out)

out, err = run("head -n 20 /home/mayowae/public_html/alphaweb/src/app/dashboard/\(pages\)/collection/Addpackage.tsx")
print(out)

client.close()
