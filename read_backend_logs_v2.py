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

import sys
sys.stdout.reconfigure(encoding='utf-8')

# skip pm2 show
# print("--- Backend PM2 Status ---")
# print(run(ssh, "pm2 show alphaweb-backend"))

print("\n--- Reading Error Log File ---")
err_log = "/root/.pm2/logs/alphaweb-backend-error.log"
print(run(ssh, f"tail -n 50 {err_log}"))

print("\n--- Reading Out Log File ---")
out_log = "/root/.pm2/logs/alphaweb-backend-out.log"
print(run(ssh, f"tail -n 50 {out_log}"))

ssh.close()
