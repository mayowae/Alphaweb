import paramiko, time, sys

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"
OUT_FILE = r"C:\Users\trade\Documents\Alphaweb-main\diag_all_domains.txt"

def run(ssh, cmd, timeout=60):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    stdout.channel.recv_exit_status()
    o = stdout.read().decode("utf-8", errors="replace").strip()
    e = stderr.read().decode("utf-8", errors="replace").strip()
    return (o + ("\n" + e if e else "")).strip()

lines = []
def say(*args):
    msg = " ".join(str(a) for a in args)
    print(msg)
    lines.append(msg)

def banner(t):
    say(f"\n{'='*60}\n  {t}\n{'='*60}")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, 22, SSH_USER, SSH_PASS, timeout=10, allow_agent=False, look_for_keys=False)
say("Connected")

DOMAINS_ALL = [
    "alphakolect.com", "bhislass.com", "paxalphaltd.com",
    "kosheglobal.com", "vinemorrisgroup.com",
    "modoniteintegrated.com.ng", "suppakash.com",
    "godproposescollege.com", "thepeopleimpact.com",
]

banner("STEP 1: HTTP/HTTPS status for all domains")
statuses = {}
for dom in DOMAINS_ALL:
    https_follow = run(ssh,
        f'curl -skL --max-redirs 8 '
        f'--resolve "{dom}:443:127.0.0.1" '
        f'--resolve "www.{dom}:443:127.0.0.1" '
        f'-o /dev/null -w "%{{http_code}}" '
        f'"https://{dom}/" 2>/dev/null || echo ERR')
    http_code = run(ssh,
        f'curl -s -o /dev/null -w "%{{http_code}}" '
        f'-H "Host: {dom}" http://127.0.0.1/ 2>/dev/null || echo ERR')
    statuses[dom] = https_follow
    ok = "OK" if https_follow in ("200","201","202") else ("WARN" if https_follow in ("301","302","403") else "FAIL")
    say(f"  [{ok}]  {dom:44s}  HTTP={http_code}  HTTPS={https_follow}")

banner("STEP 2: Nginx config files in conf.d")
say(run(ssh, "ls -la /etc/nginx/conf.d/"))

banner("STEP 3: Detailed trace for FAILING/WARN domains")
broken = [d for d, s in statuses.items() if s not in ("200","201","202")]
say(f"Problem domains: {broken}")

for dom in broken:
    say(f"\n--- curl verbose: {dom} ---")
    r = run(ssh,
        f'curl -ksv --max-redirs 8 '
        f'--resolve "{dom}:443:127.0.0.1" '
        f'--resolve "www.{dom}:443:127.0.0.1" '
        f'-o /dev/null '
        f'"https://{dom}/" 2>&1 | grep -E "Location:|< HTTP|SSL|subject|error|reset|refused|connect" | head -25',
        timeout=30)
    say(r)

banner("STEP 4: Nginx config for each problem domain")
for dom in broken:
    fname = "bhislass.conf" if dom == "bhislass.com" else f"{dom}.conf"
    say(f"\n--- /etc/nginx/conf.d/{fname} ---")
    say(run(ssh, f"cat /etc/nginx/conf.d/{fname} 2>/dev/null || echo 'NOT FOUND'"))

banner("STEP 5: SSL cert files for problem domains")
for dom in broken:
    say(f"\n--- SSL for {dom} ---")
    say(run(ssh, f"""
ls -la /var/webuzo/users/mayowae/ssl/ 2>/dev/null | grep -i '{dom[:10]}' || echo 'no match'
openssl x509 -noout -subject -dates -in /var/webuzo/users/mayowae/ssl/{dom}-combined.pem 2>/dev/null || echo 'cert MISSING or unreadable'
"""))

banner("STEP 6: Apache VirtualHost for problem domains")
for dom in broken:
    say(f"\n--- Apache VH: {dom} ---")
    say(run(ssh, f"grep -rn '{dom}' /usr/local/apps/apache2/etc/ 2>/dev/null | head -10 || echo 'not found'"))

banner("STEP 7: Is Apache listening on 8081?")
say(run(ssh, "ss -tlnp | grep 8081 || echo 'NOT listening on 8081'"))
say(run(ssh, "ss -tlnp | grep -E '80|443|8080|8081'"))

banner("STEP 8: nginx error log (last 20 lines)")
say(run(ssh, "tail -20 /var/log/nginx/error.log 2>/dev/null"))

ssh.close()
say("\nDone.")

with open(OUT_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"\nResults saved to {OUT_FILE}")
