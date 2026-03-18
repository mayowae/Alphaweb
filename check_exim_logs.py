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

print("--- Searching Exim Logs for recent emails ---")
# Try a few common log locations
log_path = ""
for p in ["/var/log/exim_mainlog", "/var/log/exim/mainlog"]:
    if "No such file" not in run(ssh, f"ls {p}"):
        log_path = p
        break

if log_path:
    print(f"Log path: {log_path}")
    print("\nRecent 100 entries for support@alphakolect.com:")
    print(run(ssh, f"grep 'support@alphakolect.com' {log_path} | tail -n 100"))
    
    print("\nRecent 50 entries with 'REJECT' or 'ERROR':")
    print(run(ssh, f"grep -Ei 'reject|error|fail' {log_path} | tail -n 50"))
else:
    print("Exim log not found!")

ssh.close()
