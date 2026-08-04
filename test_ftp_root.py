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

print("=== Testing FTP access to / ===")
# Try to list / via FTP. Since the home is /home/mayowae, we might need to go up.
# Or if we use an absolute path in the URL.
cmd = f"curl -v --connect-timeout 10 -u '{ftp_user}:{ftp_pass}' ftp://127.0.0.1// 2>&1 | grep -E '220|331|230|150|226|Error|denied|Login|Welcome|bin|etc|var|home|root'"
out = run(cmd)
print(out)

print("\n=== Testing FTP access to /etc/passwd ===")
cmd = f"curl -v --connect-timeout 10 -u '{ftp_user}:{ftp_pass}' ftp://127.0.0.1//etc/passwd 2>&1 | head -n 5"
out = run(cmd)
print(out)

client.close()
