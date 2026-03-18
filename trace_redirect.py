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

# ─── Trace redirect chain ─────────────────────────────────────────────────────
banner("STEP 1: Trace redirect chain for bhislass.com HTTPS")
print(run(ssh, r"""
echo "=== Follow HTTPS redirect chain ==="
curl -sk -L --max-redirs 5 --resolve "bhislass.com:443:127.0.0.1" \
    -D - -o /dev/null "https://bhislass.com/" 2>&1 | grep -E "HTTP/|Location:|< HTTP" | head -20

echo ""
echo "=== What bhislass.com 443 actually serves (raw headers) ==="
curl -sk --resolve "bhislass.com:443:127.0.0.1" \
    -D - -o /dev/null "https://bhislass.com/" 2>&1 | head -20

echo ""
echo "=== Direct Apache 8082 headers for bhislass.com ==="
curl -sk -o /dev/null -D - -H "Host: bhislass.com" \
    -H "X-Forwarded-Proto: https" \
    -H "HTTPS: on" \
    https://127.0.0.1:8082/ 2>&1 | head -20
"""))

# ─── Read Apache VirtualHost for bhislass.com ─────────────────────────────────
banner("STEP 2: Apache VirtualHost config for bhislass.com")
print(run(ssh, r"""
echo "=== All Apache conf files ==="
ls /usr/local/apps/apache2/etc/conf.d/

echo ""
echo "=== webuzoVH.conf first 100 lines ==="
head -100 /usr/local/apps/apache2/etc/conf.d/webuzoVH.conf 2>/dev/null

echo ""
echo "=== bhislass section in webuzoVH.conf ==="
grep -A 30 "bhislass" /usr/local/apps/apache2/etc/conf.d/webuzoVH.conf 2>/dev/null | head -50

echo ""
echo "=== Apache httpd.conf Listen ==="
grep -i "Listen\|Include" /usr/local/apps/apache2/etc/httpd.conf 2>/dev/null | head -20
"""))

# ─── Check what port Apache actually serves bhislass.com content ──────────────
banner("STEP 3: Testing Apache on 8081 with https headers")
print(run(ssh, r"""
echo "=8081 with X-Forwarded-Proto:https="
curl -s -D - -o /dev/null \
    -H "Host: bhislass.com" \
    -H "X-Forwarded-Proto: https" \
    -H "X-Forwarded-Port: 443" \
    http://127.0.0.1:8081/ 2>/dev/null | head -10

echo ""
echo "=8082 plain HTTP with https header="
curl -s -D - -o /dev/null \
    -H "Host: bhislass.com" \
    -H "X-Forwarded-Proto: https" \
    http://127.0.0.1:8082/ 2>/dev/null | head -10

echo ""
echo "=8082 HTTPS with server name="
curl -sk -D - -o /dev/null \
    -H "Host: bhislass.com" \
    --resolve "bhislass.com:8082:127.0.0.1" \
    https://bhislass.com:8082/ 2>/dev/null | head -10
"""))

with open(r"C:\Users\trade\Documents\Alphaweb-main\apache_trace.txt", "w", encoding="utf-8") as f:
    pass  # we'll write after reading

# ─── Read Apache webuzoVH.conf fully ─────────────────────────────────────────
banner("STEP 4: Full Apache webuzoVH.conf")
full_apache_vh = run(ssh, "cat /usr/local/apps/apache2/etc/conf.d/webuzoVH.conf 2>/dev/null", timeout=30)
print(full_apache_vh[:4000])

with open(r"C:\Users\trade\Documents\Alphaweb-main\apache_vhost.txt", "w", encoding="utf-8") as f:
    f.write(full_apache_vh)

ssh.close()
print("\nSaved to apache_vhost.txt")
