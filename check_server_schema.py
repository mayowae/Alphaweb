import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

# Check schema using psql
# We need to find the DB password from .env first if root/root doesn't work
# I saw DATABASE_URL=postgresql://root:Xr2J2Wx9Unk0l7rI1C@localhost:5432/alphacollect_db in earlier output
db_cmd = "PGPASSWORD='Xr2J2Wx9Unk0l7rI1C' psql -U root -d alphacollect_db -c '\\d customers'"
out, err = run(db_cmd)
print("Customers Table Schema:")
print(out)
print(err)

client.close()
