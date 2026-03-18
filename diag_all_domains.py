import paramiko, time

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"

def run(ssh, cmd, timeout=60):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    stdout.channel.recv_exit_status()
    o = stdout.read().decode("utf-8", errors="replace").strip()
    e = stderr.read().decode("utf-8", errors="replace").strip()
    return (o + ("\n" + e if e else "")).strip()

def banner(t): print(f"\n{'='*60}\n  {t}\n{'='*60}")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, 22, SSH_USER, SSH_PASS, timeout=10, allow_agent=False, look_for_keys=False)
print("✅ Connected")

DOMAINS_ALL = [
    "alphakolect.com", "bhislass.com", "paxalphaltd.com",
    "kosheglobal.com", "vinemorrisgroup.com",
    "modoniteintegrated.com.ng", "suppakash.com",
    "godproposescollege.com", "thepeopleimpact.com",
]

# ─── STEP 1: Quick HTTP status for all domains ───────────────────────────────
banner("STEP 1: HTTP/HTTPS status for all domains")
results = []
for dom in DOMAINS_ALL:
    https_code = run(ssh,
        f'curl -sk --max-redirs 0 '
        f'--resolve "{dom}:443:127.0.0.1" '
        f'-o /dev/null -w "%{{http_code}}" '
        f'"https://{dom}/" 2>/dev/null || echo ERR')
    https_follow = run(ssh,
        f'curl -skL --max-redirs 8 '
        f'--resolve "{dom}:443:127.0.0.1" '
        f'--resolve "www.{dom}:443:127.0.0.1" '
        f'-o /dev/null -w "%{{http_code}}" '
        f'"https://{dom}/" 2>/dev/null || echo ERR')
    status = "✅" if https_follow in ("200","201","202") else ("⚠️ " if https_follow in ("301","302","403") else "❌")
    line = f"  {status}  {dom:42s}  HTTPS_DIRECT={https_code}  HTTPS_FOLLOW={https_follow}"
    results.append(line)
    print(line)

# ─── STEP 2: Check which are broken — get curl verbose output ────────────────
banner("STEP 2: Detailed curl trace for broken domains")
broken = [dom for dom, line in zip(DOMAINS_ALL, results) if "❌" in line or "⚠️" in line]
print(f"Broken/warning domains: {broken}\n")

for dom in broken:
    print(f"\n--- {dom} ---")
    r = run(ssh,
        f'curl -ksv --max-redirs 5 '
        f'--resolve "{dom}:443:127.0.0.1" '
        f'-o /dev/null '
        f'"https://{dom}/" 2>&1 | grep -E "Location|< HTTP|SSL|TLS|error|connect|issue" | head -20',
        timeout=30)
    print(r)

# ─── STEP 3: Check nginx config for broken domains ───────────────────────────
banner("STEP 3: Nginx config for broken domains")
for dom in broken:
    fname = "bhislass.conf" if dom == "bhislass.com" else f"{dom}.conf"
    print(f"\n--- /etc/nginx/conf.d/{fname} ---")
    r = run(ssh, f"cat /etc/nginx/conf.d/{fname} 2>/dev/null || echo 'NOT FOUND'")
    print(r)

# ─── STEP 4: Check SSL certs for broken domains ──────────────────────────────
banner("STEP 4: SSL cert check for broken domains")
for dom in broken:
    print(f"\n--- {dom} SSL ---")
    r = run(ssh, f"""
ls -la /var/webuzo/users/mayowae/ssl/{dom}* 2>/dev/null || echo 'no cert files found'
echo ""
openssl x509 -noout -subject -dates -in /var/webuzo/users/mayowae/ssl/{dom}-combined.pem 2>/dev/null || echo 'cert read failed'
""")
    print(r)

# ─── STEP 5: Apache VirtualHost check for broken domains ─────────────────────
banner("STEP 5: Apache VirtualHost entries for broken domains")
for dom in broken:
    print(f"\n--- Apache entry for {dom} ---")
    r = run(ssh, f"""
grep -r -A5 '{dom}' /usr/local/apps/apache2/etc/conf.d/ 2>/dev/null | head -20
""")
    print(r)

# ─── STEP 6: Nginx error log tail ────────────────────────────────────────────
banner("STEP 6: Recent nginx error log (last 30 lines)")
print(run(ssh, "tail -30 /var/log/nginx/error.log 2>/dev/null || journalctl -u nginx -n 30 --no-pager 2>/dev/null"))

# ─── STEP 7: Apache error log tail ───────────────────────────────────────────
banner("STEP 7: Recent Apache error log (last 20 lines)")
print(run(ssh, """
tail -20 /usr/local/apps/apache2/logs/error_log 2>/dev/null || \
tail -20 /usr/local/apps/apache2/logs/error.log 2>/dev/null || \
echo 'no apache error log found'
"""))

ssh.close()
print("\n✅ Diagnostics complete.")
