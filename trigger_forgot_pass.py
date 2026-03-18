import paramiko
import time

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

print("--- Triggering Forgot Password ---")
# Using an email address that definitely exists (found in previous logs)
email = "mayowae@msn.com"
curl_cmd = f"curl -s -X POST http://localhost:5000/merchant/forgot-password -H 'Content-Type: application/json' -d '{{\"email\":\"{email}\"}}'"
response = run(ssh, curl_cmd)
print(f"Response: {response}")

print("\nWaiting for logs to update...")
time.sleep(3)

print("\n--- Backend Logs (last 20 lines) ---")
print(run(ssh, "pm2 logs alphaweb-backend --lines 20 --nostream"))

ssh.close()
