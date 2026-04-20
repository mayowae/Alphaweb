import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    # Try psql with full path if possible
    final_cmd = "export PGPASSWORD='mayowae_alpha'; " + cmd
    stdin, stdout, stderr = client.exec_command(final_cmd)
    return stdout.read().decode('utf-8', errors='replace'), stderr.read().decode('utf-8', errors='replace')

print("=== Checking PostgreSQL Connection ===")
out, err = run("psql -U mayowae -h localhost -d alphaweb_db -c 'SELECT 1;'")
print("STDOUT:", out)
print("STDERR:", err)

client.close()
