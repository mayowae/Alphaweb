import paramiko

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"

def run(ssh, cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    o = stdout.read().decode("utf-8", errors="replace")
    e = stderr.read().decode("utf-8", errors="replace")
    return o + e

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, 22, SSH_USER, SSH_PASS)

print("--- Listening Ports (Mail) ---")
print(run(ssh, "ss -tlnp | grep -E ':25|:465|:587'"))

print("\n--- Mail Processes ---")
print(run(ssh, "ps aux | grep -E 'exim|postfix|sendmail' | grep -v grep"))

print("\n--- Backend Logs (last 100 lines) ---")
print(run(ssh, "pm2 logs alphaweb-backend --lines 100 --no-colors"))

print("\n--- Hostname and Mail Domain check ---")
print(run(ssh, "hostname -f"))
print(run(ssh, "host mail.alphakolect.com"))

ssh.close()
