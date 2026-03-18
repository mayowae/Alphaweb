import paramiko

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

# Trace the FULL redirect chain to see what's happening
banner("Tracing redirect chain + Apache VirtualHost")
out = run(ssh, r"""
echo "=== TRACE: bhislass.com HTTPS redirect chain ==="
curl -vsk -L --max-redirs 8 \
    --resolve "bhislass.com:443:127.0.0.1" \
    --resolve "www.bhislass.com:443:127.0.0.1" \
    -o /dev/null "https://bhislass.com/" 2>&1 \
    | grep -E "< HTTP|Location:|Connected to|Trying"

echo ""
echo "=== RAW 8082 response headers for bhislass.com ==="
curl -sk -D - -o /dev/null -H "Host: bhislass.com" \
    -H "X-Forwarded-Proto: https" \
    -H "X-Forwarded-Port: 443" \
    https://127.0.0.1:8082/ 2>/dev/null | head -15

echo ""
echo "=== RAW 8081 response headers for bhislass.com ==="
curl -s -D - -o /dev/null -H "Host: bhislass.com" \
    -H "X-Forwarded-Proto: https" \
    -H "X-Forwarded-Port: 443" \
    http://127.0.0.1:8081/ 2>/dev/null | head -15

echo ""
echo "=== Apache webuzoVH.conf bhislass section ==="
awk '/bhislass\.com/{found=1} found{print; if(/^<\/VirtualHost>/) {found=0}}' \
    /usr/local/apps/apache2/etc/conf.d/webuzoVH.conf 2>/dev/null | head -40

echo ""
echo "=== All ports Apache listens on ==="
grep -r "Listen\b" /usr/local/apps/apache2/etc/ 2>/dev/null | grep -v "#"

echo ""
echo "=== WordPress bhislass config location ==="
find /home/mayowae/bhislass.com -name 'wp-config.php' 2>/dev/null | head -2
find /home/mayowae/bhislass.com -name '.htaccess' 2>/dev/null | head -2

echo ""
echo "=== bhislass .htaccess ==="
cat /home/mayowae/bhislass.com/.htaccess 2>/dev/null | head -20

echo ""
echo "=== bhislass wp-config.php relevant lines ==="
grep -i "HTTPS\|siteurl\|home\|X_FORWARD\|proxy\|WP_HOME\|WP_SITEURL" \
    /home/mayowae/bhislass.com/wp-config.php 2>/dev/null | head -20
""", timeout=60)

print(out)
with open(r"C:\Users\trade\Documents\Alphaweb-main\trace_full.txt", "w", encoding="utf-8") as f:
    f.write(out)

ssh.close()
print("\nSaved to trace_full.txt")
