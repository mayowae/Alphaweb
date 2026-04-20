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

print("=== Checking merchantController.js for getSubscriptionInfo ===")
out = run("grep -n \"getSubscriptionInfo\" /home/mayowae/public_html/alphaweb/backend/controllers/merchantController.js")
print(out)

# If found, read some lines around it
if out:
    line_num = int(out.split(':')[0])
    lines_cmd = f"sed -n '{line_num-10},{line_num+20}p' /home/mayowae/public_html/alphaweb/backend/controllers/merchantController.js"
    print(run(lines_cmd))

client.close()
