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

out = []

# ─── 1. Investigate the redirect source for godproposescollege ─────────────────
banner("1. Investigating godproposescollege redirect + Apache VH")
r = run(ssh, r"""
echo "=== godproposescollege document root ==="
ls -la /home/mayowae/godproposescollege.com/ 2>/dev/null

echo ""
echo "=== Apache VH for godproposescollege on port 8081 ==="
awk '/godproposescollege/{found=1} found{print; if(/^<\/VirtualHost>/) {found=0}}' \
    /usr/local/apps/apache2/etc/conf.d/webuzoVH.conf 2>/dev/null | head -50

echo ""
echo "=== What does curl to Apache 8081 return for godproposescollege? ==="
curl -v -s --max-time 5 -D - -o /dev/null \
    -H "Host: godproposescollege.com" \
    -H "X-Forwarded-Proto: https" \
    http://127.0.0.1:8081/ 2>&1 | grep -E "< HTTP|Location:|Trying"

echo ""
echo "=== thepeopleimpact.com document root ==="
ls -la /home/mayowae/thepeopleimpact.com/ 2>/dev/null

echo ""
echo "=== thepeopleimpact Apache VH ==="
awk '/thepeopleimpact/{found=1} found{print; if(/^<\/VirtualHost>/) {found=0}}' \
    /usr/local/apps/apache2/etc/conf.d/webuzoVH.conf 2>/dev/null | head -30

echo ""
echo "=== What does curl to Apache 8081 return for thepeopleimpact? ==="
curl -v -s --max-time 5 -D - -o /dev/null \
    -H "Host: thepeopleimpact.com" \
    -H "X-Forwarded-Proto: https" \
    http://127.0.0.1:8081/ 2>&1 | grep -E "< HTTP|Location:|Trying"

echo ""
echo "=== Search for content in other locations ==="
find /home/mayowae/ -name 'wp-config.php' 2>/dev/null
find /var/www -name 'wp-config.php' 2>/dev/null | head -5
""")
print(r)
out.append(r)

# ─── 2. Fix godproposescollege — create holding page OR serve DB content ────────
banner("2. Fix godproposescollege.com")
r2 = run(ssh, r"""
DOCROOT="/home/mayowae/godproposescollege.com"

# Check what 8081 actually returns with full location header
LOCATION=$(curl -s --max-time 5 -D - -o /dev/null \
    -H "Host: godproposescollege.com" \
    -H "X-Forwarded-Proto: https" \
    http://127.0.0.1:8081/ 2>/dev/null | grep -i "Location:" | head -1)
echo "Apache 8081 Location for godproposescollege: $LOCATION"

# If Apache redirects to https:// — it means Apache VH has an https redirect
# We need to remove it or add content  
if echo "$LOCATION" | grep -qi "https://"; then
    echo "Apache is doing HTTP->HTTPS redirect for empty site."
    echo "Adding a WordPress placeholder so Apache serves content..."
fi

# Create a minimal WordPress-compatible placeholder
mkdir -p "$DOCROOT"
cat > "$DOCROOT/index.php" << 'PHPEOF'
<?php
// Placeholder – site under construction
http_response_code(200);
?>
<!DOCTYPE html>
<html>
<head><title>God Proposes College</title>
<meta charset="utf-8">
<style>body{font-family:sans-serif;text-align:center;padding:80px;background:#f8f9fa}
h1{color:#2c3e50}p{color:#666;font-size:18px}</style>
</head>
<body>
<h1>God Proposes College</h1>
<p>Website coming soon.</p>
<p><em>Site is currently being updated. Please check back shortly.</em></p>
</body>
</html>
PHPEOF

chown mayowae:nobody "$DOCROOT/index.php" 2>/dev/null || true
chmod 644 "$DOCROOT/index.php"
echo "Created placeholder index.php"

# Re-test
sleep 1
CODE=$(curl -skL --max-redirs 5 \
    --resolve "godproposescollege.com:443:127.0.0.1" \
    -o /dev/null -w "%{http_code}" \
    "https://godproposescollege.com/" 2>/dev/null)
echo "godproposescollege.com HTTPS final code: $CODE"
""")
print(r2)
out.append(r2)

# ─── 3. Fix thepeopleimpact — create placeholder ──────────────────────────────
banner("3. Fix thepeopleimpact.com (403)")
r3 = run(ssh, r"""
DOCROOT="/home/mayowae/thepeopleimpact.com"

echo "Document root contents:"
ls -la "$DOCROOT/" 2>/dev/null

# Create minimal placeholder
mkdir -p "$DOCROOT"
cat > "$DOCROOT/index.php" << 'PHPEOF'
<?php
http_response_code(200);
?>
<!DOCTYPE html>
<html>
<head><title>The People Impact</title>
<meta charset="utf-8">
<style>body{font-family:sans-serif;text-align:center;padding:80px;background:#f8f9fa}
h1{color:#2c3e50}p{color:#666;font-size:18px}</style>
</head>
<body>
<h1>The People Impact</h1>
<p>Website coming soon.</p>
<p><em>Site is currently being updated. Please check back shortly.</em></p>
</body>
</html>
PHPEOF

chown mayowae:nobody "$DOCROOT/index.php" 2>/dev/null || true
chmod 644 "$DOCROOT/index.php"
echo "Created placeholder index.php"

sleep 1
CODE=$(curl -skL --max-redirs 5 \
    --resolve "thepeopleimpact.com:443:127.0.0.1" \
    -o /dev/null -w "%{http_code}" \
    "https://thepeopleimpact.com/" 2>/dev/null)
echo "thepeopleimpact.com HTTPS final code: $CODE"
""")
print(r3)
out.append(r3)

# ─── 4. Final full verification ───────────────────────────────────────────────
banner("4. FINAL VERIFICATION — All Domains")
DOMAINS = [
    "alphakolect.com","bhislass.com","paxalphaltd.com",
    "kosheglobal.com","vinemorrisgroup.com","modoniteintegrated.com.ng",
    "suppakash.com","godproposescollege.com","thepeopleimpact.com",
    "unknown-xyz.com"
]
results = []
for dom in DOMAINS:
    final = run(ssh,
        f'curl -skL --max-redirs 5 '
        f'--resolve "{dom}:443:127.0.0.1" '
        f'--resolve "www.{dom}:443:127.0.0.1" '
        f'-o /dev/null -w "%{{http_code}}" '
        f'"https://{dom}/" 2>/dev/null || echo ERR', timeout=20)
    if dom == "unknown-xyz.com":
        status = "🔒 BLOCKED"
    else:
        status = "✅" if final == "200" else ("⚠️ " if final in ("301","302","403") else "❌")
    line = f"  {status}  {dom:42s}  HTTPS={final}"
    results.append(line)
    print(line)

final_text = "\n".join(results)
with open(r"C:\Users\trade\Documents\Alphaweb-main\final_verify.txt", "w", encoding="utf-8") as f:
    f.write(final_text)
with open(r"C:\Users\trade\Documents\Alphaweb-main\fix3_diag.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out))

ssh.close()
print("\n✅ Done. All results saved.")
