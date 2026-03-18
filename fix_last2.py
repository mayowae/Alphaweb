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

out_lines = []

def log(msg):
    print(msg)
    out_lines.append(str(msg))

# ═══════════════════════════════════════════════════════════
# FIX 1: godproposescollege.com (HTTPS redirect loop)
# ═══════════════════════════════════════════════════════════
banner("FIX 1: godproposescollege.com")

diag1 = run(ssh, r"""
echo "=== SSL cert files ==="
ls -la /var/webuzo/users/mayowae/ssl/godproposescollege* 2>/dev/null || echo "NO CERTS"

echo ""
echo "=== Try creating combined PEM if missing ==="
CERT="/var/webuzo/users/mayowae/ssl/godproposescollege.com-combined.pem"
KEY="/var/webuzo/users/mayowae/ssl/godproposescollege.com.key"
CRT="/var/webuzo/users/mayowae/ssl/godproposescollege.com.crt"
CA="/var/webuzo/users/mayowae/ssl/godproposescollege.com-ca.crt"

if [ ! -f "$CERT" ]; then
    echo "Combined PEM missing — building it..."
    if [ -f "$CRT" ] && [ -f "$CA" ]; then
        cat "$CRT" "$CA" > "$CERT"
        echo "  Built: $CERT"
    elif [ -f "$CRT" ]; then
        cp "$CRT" "$CERT"
        echo "  Built from CRT only: $CERT"
    else
        echo "  ERROR: No .crt file found!"
    fi
else
    echo "Combined PEM exists."
    openssl x509 -in "$CERT" -noout -subject -enddate 2>/dev/null
fi

echo ""
echo "=== nginx cert test for godproposescollege ==="
cat /etc/nginx/conf.d/godproposescollege.com.conf | grep ssl_cert

echo ""
echo "=== WordPress siteurl for godproposescollege ==="
find /home/mayowae/godproposescollege.com -name 'wp-config.php' 2>/dev/null | xargs grep -i "WP_HOME\|WP_SITEURL\|siteurl\|home" 2>/dev/null | head -10

echo ""
echo "=== Check WP DB siteurl ==="
WP_DIR="/home/mayowae/godproposescollege.com"
if [ -f "$WP_DIR/wp-config.php" ]; then
    DB_NAME=$(grep "DB_NAME" "$WP_DIR/wp-config.php" | grep -oP "(?<=')[^']+")
    DB_USER=$(grep "DB_USER" "$WP_DIR/wp-config.php" | grep -oP "(?<=')[^']+")
    DB_PASS=$(grep "DB_PASSWORD" "$WP_DIR/wp-config.php" | grep -oP "(?<=')[^']+")
    DB_HOST=$(grep "DB_HOST" "$WP_DIR/wp-config.php" | grep -oP "(?<=')[^']+")
    echo "DB: $DB_NAME / $DB_USER @ $DB_HOST"
    mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" \
        -e "SELECT option_name, option_value FROM wp_options WHERE option_name IN ('siteurl','home');" 2>/dev/null || \
    mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" \
        -e "SELECT option_name, option_value FROM wp_options WHERE option_name IN ('siteurl','home');" 2>/dev/null
fi

echo ""
echo "=== HTTPS redirect chain for godproposescollege ==="
curl -vsk -L --max-redirs 3 \
    --resolve "godproposescollege.com:443:127.0.0.1" \
    -o /dev/null "https://godproposescollege.com/" 2>&1 \
    | grep -E "< HTTP|Location:|SSL|Trying"
""")
log(diag1)

# ═══════════════════════════════════════════════════════════
# FIX 2: thepeopleimpact.com (403 Forbidden)
# ═══════════════════════════════════════════════════════════
banner("FIX 2: thepeopleimpact.com (403)")

diag2 = run(ssh, r"""
DOCROOT="/home/mayowae/thepeopleimpact.com"

echo "=== Directory listing ==="
ls -la "$DOCROOT/" 2>/dev/null | head -15 || echo "DIR NOT FOUND"

echo ""
echo "=== Directory permissions ==="
stat "$DOCROOT" 2>/dev/null | grep -E "Access:|Uid:|Gid:"
stat /home/mayowae 2>/dev/null | grep -E "Access:|Uid:|Gid:"

echo ""
echo "=== Apache error log for thepeopleimpact ==="
find /usr/local/apps/apache2 -name '*.err' -o -name 'error_log' 2>/dev/null | \
    xargs grep -i "thepeopleimpact" 2>/dev/null | tail -10

echo ""
echo "=== Apache VH config for thepeopleimpact ==="
awk '/thepeopleimpact/{found=1} found{print; if(/^<\/VirtualHost>/) {found=0}}' \
    /usr/local/apps/apache2/etc/conf.d/webuzoVH.conf 2>/dev/null | head -25

echo ""
echo "=== HTTPS raw response ==="
curl -sk -D - -o /dev/null \
    --resolve "thepeopleimpact.com:443:127.0.0.1" \
    "https://thepeopleimpact.com/" 2>&1 | head -15
""")
log(diag2)

# Apply fix for thepeopleimpact.com permissions
banner("Applying permission fix for thepeopleimpact.com")
fix2 = run(ssh, r"""
DOCROOT="/home/mayowae/thepeopleimpact.com"

echo "Fixing ownership and permissions..."
chown -R mayowae:mayowae "$DOCROOT" 2>/dev/null || true
find "$DOCROOT" -type d -exec chmod 755 {} \; 2>/dev/null
find "$DOCROOT" -type f -exec chmod 644 {} \; 2>/dev/null
# Executable scripts need 755
find "$DOCROOT" -name "*.sh" -exec chmod 755 {} \; 2>/dev/null
chmod 600 "$DOCROOT/wp-config.php" 2>/dev/null || true
echo "Permissions fixed"

echo ""
echo "=== Re-test after fix ==="
sleep 1
curl -skL --max-redirs 5 \
    --resolve "thepeopleimpact.com:443:127.0.0.1" \
    -o /dev/null -w "HTTPS: %{http_code}" \
    "https://thepeopleimpact.com/" 2>/dev/null
echo ""
""")
log(fix2)

# ─── Final verification ───────────────────────────────────────────────────────
banner("FINAL VERIFICATION — All Domains")
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
    if dom == "unknown-xyz.com":
        final_http = run(ssh, f'curl -s -o /dev/null -w "%{{http_code}}" -H "Host: {dom}" http://127.0.0.1/ 2>/dev/null')
        status = "🔒 BLOCKED" if "000" in final_http else "❌ LEAK"
        line = f"  {status}  {dom:42s}  HTTPS={final}"
    else:
        status = "✅" if final == "200" else ("⚠️ " if final in ("301","302","403") else "❌")
        line = f"  {status}  {dom:42s}  HTTPS={final}"
    results.append(line)
    log(line)

with open(r"C:\Users\trade\Documents\Alphaweb-main\final_verify.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(results))
with open(r"C:\Users\trade\Documents\Alphaweb-main\fix2_output.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out_lines))

ssh.close()
print("\n✅ Done. Results saved.")
