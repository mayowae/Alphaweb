import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(hostname, port=port, username=username, password=password, timeout=30)
except Exception as e:
    print(f"Failed to connect: {e}")
    exit(1)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

config_path = "/usr/local/apps/pureftpd/etc/pure-ftpd.conf"

print("=== Enabling UnixAuthentication and Root Access ===")
run(f"sed -i 's/^# UnixAuthentication/UnixAuthentication/' {config_path}")
run(f"sed -i 's/^UnixAuthentication.*no/UnixAuthentication            yes/' {config_path}")
run(f"sed -i 's/^MinUID.*/MinUID                      0/' {config_path}")

# Check for ftpusers file which often blocks root
ftpusers_paths = ["/etc/ftpusers", "/usr/local/apps/pureftpd/etc/ftpusers"]
for p in ftpusers_paths:
    exists = run(f"ls {p}")
    if "No such file" not in exists:
        print(f"Checking {p}...")
        run(f"sed -i '/^root$/d' {p}")

print("\n=== Restarting pure-ftpd ===")
print(run("service pure-ftpd restart"))

print("\n=== Testing root login via FTP ===")
# Note: Root login via FTP is often disabled in the binary itself for security.
cmd = f"curl -v --connect-timeout 10 -u 'root:{password}' ftp://127.0.0.1/ 2>&1 | grep -E '220|331|230|530|Error|denied|Login|Welcome'"
out = run(cmd)
print(out)

client.close()
