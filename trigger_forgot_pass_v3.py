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

output = []

output.append("--- Triggering Forgot Password (Merchant) ---")
email = "mayowae@msn.com"
curl_cmd = f"curl -i -X POST http://localhost:5000/merchant/forgot-password -H 'Content-Type: application/json' -d '{{\"email\":\"{email}\"}}'"
response = run(ssh, curl_cmd)
output.append(f"Response:\n{response}")

output.append("\n--- Triggering Forgot Password (Collaborator) ---")
email = "mayowae@msn.com"
curl_cmd = f"curl -i -X POST http://localhost:5000/collaborator/forgot-password -H 'Content-Type: application/json' -d '{{\"email\":\"{email}\"}}'"
response = run(ssh, curl_cmd)
output.append(f"Response:\n{response}")

ssh.close()

with open('trigger_results.txt', 'w') as f:
    f.write("\n".join(output))
print("Results saved to trigger_results.txt")
