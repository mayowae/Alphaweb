import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    env = "export PGPASSWORD='mayowae_alpha';"
    stdin, stdout, stderr = client.exec_command(env + cmd)
    return stdout.read().decode('utf-8', errors='replace')

print("=== Checking PostgreSQL Tables ===")
out = run("psql -U mayowae -h localhost -d alphaweb_db -c \"\\dt\"")
print(out)

client.close()
