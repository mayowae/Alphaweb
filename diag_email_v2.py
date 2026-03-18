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

print("--- PM2 Backend Logs (last 50 lines) ---")
# pm2 logs [id/name] --lines [number] --nostream --err or --out
print(run(ssh, "pm2 logs alphaweb-backend --lines 50 --nostream"))

print("\n--- Testing SMTP connection with openssl ---")
# Testing port 465 (SSL)
print(run(ssh, "echo 'QUIT' | openssl s_client -connect 127.0.0.1:465 -quiet 2>/dev/null"))

print("\n--- Exim Log (last 50 lines) ---")
# Common exim log locations
print(run(ssh, "tail -n 50 /var/log/exim/mainlog 2>/dev/null || tail -n 50 /var/log/exim_mainlog 2>/dev/null"))

ssh.close()
