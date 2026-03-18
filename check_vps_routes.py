import paramiko

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"

def run(ssh, cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    o = stdout.read().decode("utf-8", errors="replace")
    e = stderr.read().decode("utf-8", errors="replace")
    return (o + e).strip()

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, 22, SSH_USER, SSH_PASS)

print("--- Checking Dashboard routes in server.js on VPS ---")
# Finding the project dir first (likely /root/alpha-collect-backend or similar)
# Actually I'll use the find command
find_cmd = "find /root -name server.js | grep backend"
path = run(ssh, find_cmd).split('\n')[0]
print(f"Server Path: {path}")

if path:
    grep_cmd = f"grep -C 5 '/dashboard' {path}"
    print(run(ssh, grep_cmd))

ssh.close()
