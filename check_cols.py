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
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

# Check actual DB column names
print("=== merchants table columns ===")
out = run("psql -U alphaweb_user -d alphaweb_db -c \"SELECT column_name FROM information_schema.columns WHERE table_name='merchants' ORDER BY ordinal_position;\"")
print(out)

client.close()
