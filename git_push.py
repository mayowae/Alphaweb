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

print("--- pulling and pushing ---")
cmds = [
    "git pull origin main --rebase",
    "git push origin main"
]

for c in cmds:
    print(f"Running: {c}")
    o, e = run(f"cd /home/mayowae/public_html/alphaweb && {c}")
    print("OUT:", o)
    print("ERR:", e)

client.close()
