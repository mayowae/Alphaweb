import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    final_cmd = "export PGPASSWORD='AlphaWeb2026!'; " + cmd
    stdin, stdout, stderr = client.exec_command(final_cmd)
    return stdout.read().decode('utf-8', errors='replace'), stderr.read().decode('utf-8', errors='replace')

print("=== Checking Merchants Table Columns In alphacollect_db ===")
out, err = run("psql -U alpha_admin -h localhost -d alphacollect_db -c \"SELECT column_name FROM information_schema.columns WHERE table_name = 'merchants';\"")
print(out)
if err: print("STDERR:", err)

client.close()
