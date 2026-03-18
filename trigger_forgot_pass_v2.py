import paramiko
import time

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

print("--- Triggering Forgot Password (Merchant) ---")
email = "mayowae@msn.com"
curl_cmd = f"curl -i -X POST http://localhost:5000/merchant/forgot-password -H 'Content-Type: application/json' -d '{{\"email\":\"{email}\"}}'"
response = run(ssh, curl_cmd)
print(f"Response:\n{response}")

print("\n--- Triggering Forgot Password (Collaborator) ---")
# Let's try one more email address or the same one for collaborator
email = "mayowae@msn.com"
curl_cmd = f"curl -i -X POST http://localhost:5000/collaborator/forgot-password -H 'Content-Type: application/json' -d '{{\"email\":\"{email}\"}}'"
response = run(ssh, curl_cmd)
print(f"Response:\n{response}")

print("\nWaiting for logs...")
time.sleep(3)

print("\n--- Backend Logs (last 30 lines) ---")
print(run(ssh, "pm2 logs alphaweb-backend --lines 30 --nostream"))

ssh.close()
