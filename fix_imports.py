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
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace')

print("=== Fixing invalid api imports ===")

# Fix 7 levels -> 6 levels
find_cmd = 'grep -rl "../../../../../../../services/api" /home/mayowae/public_html/alphaweb/src/'
files = run(find_cmd).splitlines()

for f in files:
    if f.strip():
        print(f"Fixing {f}...")
        sed_cmd = f"sed -i 's|../../../../../../../services/api|../../../../../../services/api|g' {f}"
        run(sed_cmd)

# Also check for 8 levels if any
find_cmd_8 = 'grep -rl "../../../../../../../../services/api" /home/mayowae/public_html/alphaweb/src/'
files_8 = run(find_cmd_8).splitlines()
for f in files_8:
    if f.strip():
        print(f"Fixing 8-level {f}...")
        sed_cmd = f"sed -i 's|../../../../../../../../services/api|../../../../../../services/api|g' {f}"
        run(sed_cmd)

print("Done.")
client.close()
