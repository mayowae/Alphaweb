import paramiko
import json
import time

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

# Step 1: Get a list of existing merchants to find one to test with
print("=== Find a merchant email to test ===")
out = run("PGPASSWORD='AlphaWeb2026!' psql -h localhost -U alpha_admin -d alphacollect_db -t -c \"SELECT email FROM merchants LIMIT 3;\" 2>&1")
print(out)

# Step 2: Check backend new error logs (after restart)
print("\n=== Backend errors after fix ===")
out = run("tail -n 20 /home/mayowae/public_html/alphaweb/logs/backend-error-0.log")
print(out)

client.close()
