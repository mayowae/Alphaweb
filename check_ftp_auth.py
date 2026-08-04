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

print("=== Checking Authentication Methods ===")
print(run(f"grep -iE 'UnixAuthentication|PureDB' {config_path}"))

print("\n=== Checking for ftpusers file ===")
print(run("ls -l /etc/ftpusers /usr/local/apps/pureftpd/etc/ftpusers 2>/dev/null"))

client.close()
