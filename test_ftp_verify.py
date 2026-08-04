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

ftp_user = 'alphawebftp'
ftp_pass = 'AlphaFTP@2026!'

print(f"Testing FTP login for {ftp_user}...")
# Use curl to test local FTP login
cmd = f"curl -v --connect-timeout 10 -u '{ftp_user}:{ftp_pass}' ftp://127.0.0.1/ 2>&1 | grep -E '220|331|230|530|227|150|Error|denied|Login|Welcome'"
out = run(cmd)
print(out)

print("\nChecking for other users...")
print(run("pure-pw list"))

client.close()
