import paramiko

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"

def run(ssh, cmd, timeout=30):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    stdout.channel.recv_exit_status()
    o = stdout.read().decode("utf-8", errors="replace").strip()
    e = stderr.read().decode("utf-8", errors="replace").strip()
    return (o + ("\n" + e if e else "")).strip()

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, 22, SSH_USER, SSH_PASS, timeout=10, allow_agent=False, look_for_keys=False)

lines = []

lines.append("=== NGINX TEST ===")
lines.append(run(ssh, "nginx -t 2>&1"))

lines.append("\n=== CONF.D FILES ===")
lines.append(run(ssh, "ls -la /etc/nginx/conf.d/"))

lines.append("\n=== DOMAIN VERIFICATION ===")
domains = [
    "alphakolect.com",
    "bhislass.com",
    "paxalphaltd.com",
    "kosheglobal.com",
    "vinemorrisgroup.com",
    "modoniteintegrated.com.ng",
    "suppakash.com",
    "godproposescollege.com",
    "thepeopleimpact.com",
    "unknown-xyz-test.com",
]
for dom in domains:
    http = run(ssh, f'curl -s -o /dev/null -w "%{{http_code}}" --connect-timeout 5 -H "Host: {dom}" http://127.0.0.1/ 2>/dev/null || echo ERR')
    https = run(ssh, f'curl -sk -o /dev/null -w "%{{http_code}}" --connect-timeout 5 --resolve "{dom}:443:127.0.0.1" "https://{dom}/" 2>/dev/null || echo ERR')
    lines.append(f"  {dom:42s}  HTTP={http}  HTTPS={https}")

lines.append("\n=== NGINX PROCESSES ===")
lines.append(run(ssh, "ps aux | grep nginx | grep -v grep"))

lines.append("\n=== PM2 STATUS ===")
lines.append(run(ssh, "pm2 list"))

ssh.close()

output = "\n".join(lines)
print(output)

with open(r"C:\Users\trade\Documents\Alphaweb-main\verify_output.txt", "w", encoding="utf-8") as f:
    f.write(output)
print("\nSaved to verify_output.txt")
