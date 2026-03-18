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

print("=== NGINX TEST ===")
print(run(ssh, "nginx -t 2>&1"))

print("")
print("=== CONF.D FILES ===")
print(run(ssh, "ls -la /etc/nginx/conf.d/"))

print("")
print("=== DOMAIN VERIFICATION ===")
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
    status = "✅" if http in ("301","200") and https in ("200","301","302") else "⚠️ "
    if dom == "unknown-xyz-test.com":
        status = "✅" if http == "000" or http == "444" else "❌ STILL LEAKING"
    print(f"  {status}  {dom:42s}  HTTP={http}  HTTPS={https}")

print("")
print("=== NGINX PROCESSES ===")
print(run(ssh, "ps aux | grep nginx | grep -v grep"))

print("")
print("=== PM2 STATUS ===")
print(run(ssh, "pm2 list"))

ssh.close()
print("\nDone.")
