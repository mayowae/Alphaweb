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

# ─── Diagnose godproposescollege.com ─────────────────────────────────────────
banner("Diagnosing godproposescollege.com")
print(run(ssh, r"""
echo "=== Cert files ==="
ls -la /var/webuzo/users/mayowae/ssl/godproposescollege* 2>/dev/null || echo "No certs found"

echo ""
echo "=== HTTPS raw headers ==="
curl -sk -D - -o /dev/null \
    --resolve "godproposescollege.com:443:127.0.0.1" \
    "https://godproposescollege.com/" 2>&1 | head -15

echo ""
echo "=== Follow redirect chain ==="
curl -vsk -L --max-redirs 5 \
    --resolve "godproposescollege.com:443:127.0.0.1" \
    -o /dev/null "https://godproposescollege.com/" 2>&1 \
    | grep -E "Location:|< HTTP|Trying|Connected"

echo ""
echo "=== nginx error log for godproposescollege ==="
grep "godproposescollege" /var/log/nginx/error.log 2>/dev/null | tail -10
"""))

# ─── Diagnose thepeopleimpact.com ────────────────────────────────────────────
banner("Diagnosing thepeopleimpact.com (403)")
print(run(ssh, r"""
echo "=== Document root permissions ==="
ls -la /home/mayowae/thepeopleimpact.com/ 2>/dev/null | head -10
ls -la /home/mayowae/ 2>/dev/null | grep thepeopleimpact

echo ""
echo "=== Apache error log for thepeopleimpact ==="
grep -i "thepeopleimpact\|403" /usr/local/apps/apache2/var/log/error_log 2>/dev/null | tail -15 || \
find /usr/local/apps/apache2 -name 'error_log' 2>/dev/null | xargs grep -i "thepeopleimpact\|403" 2>/dev/null | tail -15

echo ""
echo "=== thepeopleimpact .htaccess ==="
cat /home/mayowae/thepeopleimpact.com/.htaccess 2>/dev/null | head -20

echo ""
echo "=== thepeopleimpact directory index ==="
ls /home/mayowae/thepeopleimpact.com/ 2>/dev/null | head -10
"""))

# ─── Fix godproposescollege.com ───────────────────────────────────────────────
banner("Fixing godproposescollege.com")
print(run(ssh, r"""
# Check if the combined PEM cert exists
CERT="/var/webuzo/users/mayowae/ssl/godproposescollege.com-combined.pem"
KEY="/var/webuzo/users/mayowae/ssl/godproposescollege.com.key"

if [ ! -f "$CERT" ]; then
    echo "⚠️  Combined PEM not found! Checking for individual cert files..."
    ls /var/webuzo/users/mayowae/ssl/ | grep -i "godpropos"
    # Try creating combined pem from crt + ca
    CRT="/var/webuzo/users/mayowae/ssl/godproposescollege.com.crt"
    CA="/var/webuzo/users/mayowae/ssl/godproposescollege.com-ca.crt"
    if [ -f "$CRT" ]; then
        if [ -f "$CA" ]; then
            cat "$CRT" "$CA" > "$CERT"
            echo "Created combined PEM from .crt + -ca.crt"
        else
            cp "$CRT" "$CERT"
            echo "Created combined PEM from .crt only"
        fi
    fi
else
    echo "✅ Cert exists: $CERT"
    openssl x509 -in "$CERT" -noout -subject -dates 2>/dev/null
fi

echo ""
echo "=== Checking redirect on godproposescollege ==="
curl -sk -D - -o /dev/null \
    --resolve "godproposescollege.com:443:127.0.0.1" \
    "https://godproposescollege.com/" 2>&1 | head -10
"""))

# ─── Fix thepeopleimpact.com 403 ─────────────────────────────────────────────
banner("Fixing thepeopleimpact.com 403")
print(run(ssh, r"""
DOCROOT="/home/mayowae/thepeopleimpact.com"
echo "Fixing permissions on $DOCROOT..."
chmod 755 "$DOCROOT" 2>/dev/null
chmod -R 644 "$DOCROOT"/*.php 2>/dev/null || true
find "$DOCROOT" -type d -exec chmod 755 {} \; 2>/dev/null
find "$DOCROOT" -type f -name "*.php" -exec chmod 644 {} \; 2>/dev/null
echo "Permissions fixed"

echo ""
echo "=== Index files in root ==="
ls -la "$DOCROOT/" | head -15

echo ""
echo "=== Re-test thepeopleimpact ==="
sleep 1
curl -skL --max-redirs 5 --resolve "thepeopleimpact.com:443:127.0.0.1" \
    -o /dev/null -w "HTTPS final: %{http_code}" "https://thepeopleimpact.com/" 2>/dev/null
echo ""
"""))

# ─── Final verification ───────────────────────────────────────────────────────
banner("Final verification of ALL domains")
DOMAINS_ALL = [
    "alphakolect.com", "bhislass.com", "paxalphaltd.com",
    "kosheglobal.com", "vinemorrisgroup.com", "modoniteintegrated.com.ng",
    "suppakash.com", "godproposescollege.com", "thepeopleimpact.com",
    "unknown-xyz.com"
]
results = []
for dom in DOMAINS_ALL:
    final = run(ssh,
        f'curl -skL --max-redirs 5 '
        f'--resolve "{dom}:443:127.0.0.1" '
        f'--resolve "www.{dom}:443:127.0.0.1" '
        f'-o /dev/null -w "%{{http_code}}" '
        f'"https://{dom}/" 2>/dev/null || echo ERR', timeout=20)
    http = run(ssh,
        f'curl -s -o /dev/null -w "%{{http_code}}" '
        f'-H "Host: {dom}" http://127.0.0.1/ 2>/dev/null || echo ERR', timeout=10)
    if dom == "unknown-xyz.com":
        status = "🔒 BLOCKED" if "000" in http else "❌ LEAK"
    else:
        status = "✅" if final == "200" else ("⚠️ " if final in ("301","302","403") else "❌")
    line = f"  {status}  {dom:42s}  HTTP={http}  HTTPS={final}"
    results.append(line)
    print(line)

with open(r"C:\Users\trade\Documents\Alphaweb-main\final_verify.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(results))
print("\nSaved to final_verify.txt")
ssh.close()
print("✅ Done.")
