import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    # Set PGPASSWORD so psql doesn't prompt for password
    env = "export PGPASSWORD='mayowae_alpha';"
    stdin, stdout, stderr = client.exec_command(env + cmd)
    return stdout.read().decode('utf-8', errors='replace')

print("=== Checking Merchants Table Columns ===")
out = run("psql -U mayowae -h localhost -d alphaweb_db -c \"SELECT column_name FROM information_schema.columns WHERE table_name = 'merchants';\"")
print(out)

client.close()
