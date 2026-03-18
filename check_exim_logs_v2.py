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

print("--- Searching Exim Logs for support@alphakolect.com ---")
log_path = "/var/log/exim/main.log"
print(run(ssh, f"grep 'support@alphakolect.com' {log_path} | tail -n 50"))

print("\n--- Reject Log ---")
print(run(ssh, f"tail -n 20 /var/log/exim/reject.log"))

ssh.close()
