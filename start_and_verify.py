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

print("=== PORT 80 STATUS ===")
print(run(ssh, "ss -tulpn | grep ':80\\|:443 '"))

print("\n=== ALL NGINX PROCESSES ===")
print(run(ssh, "ps aux | grep nginx | grep -v grep"))

print("\n=== NGINX BINARY ===")
print(run(ssh, "which nginx && /usr/sbin/nginx -v 2>&1"))

print("\n=== NGINX CONFIG TEST ===")
test = run(ssh, "nginx -t 2>&1")
print(test)

print("\n=== ALPHAWEB.CONF CONTENT ===")
print(run(ssh, "cat /etc/nginx/conf.d/alphaweb.conf"))

if "test is successful" in test:
    print("\n=== STARTING SYSTEM NGINX ===")
    # Try multiple start methods
    r1 = run(ssh, "systemctl start nginx 2>&1 && echo 'systemctl OK' || echo 'systemctl failed'")
    print(r1)
    if "failed" in r1.lower() or "error" in r1.lower():
        r2 = run(ssh, "/usr/sbin/nginx 2>&1 && echo 'direct start OK' || echo 'direct start failed'")
        print(r2)

    import time
    time.sleep(2)
    print("\n=== PORT 80 AFTER START ===")
    print(run(ssh, "ss -tulpn | grep ':80\\|:443 '"))

    print("\n=== NGINX PROCESSES AFTER START ===")
    print(run(ssh, "ps aux | grep nginx | grep -v grep"))

    print("\n=== DOMAIN VERIFICATION ===")
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
    results = []
    for dom in domains:
        http = run(ssh, f'curl -s -o /dev/null -w "%{{http_code}}" --connect-timeout 5 -H "Host: {dom}" http://127.0.0.1/ 2>/dev/null || echo ERR')
        https = run(ssh, f'curl -sk -o /dev/null -w "%{{http_code}}" --connect-timeout 5 --resolve "{dom}:443:127.0.0.1" "https://{dom}/" 2>/dev/null || echo ERR')

        if dom == "unknown-xyz-test.com":
            ok = "✅ BLOCKED" if "000" in http or "444" in http else "❌ LEAKING"
        else:
            ok = "✅" if http in ("301","200","302") else "⚠️ "
        line = f"  {ok}  {dom:42s}  HTTP={http}  HTTPS={https}"
        results.append(line)
        print(line)
else:
    print("\n⚠️  Config has errors - not starting nginx. Fix errors first!")
    print("Detailed config error:")
    print(run(ssh, "nginx -T 2>&1 | head -50"))

ssh.close()
print("\nDone.")
