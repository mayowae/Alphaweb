import paramiko, time

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"
OUT_FILE = r"C:\Users\trade\Documents\Alphaweb-main\fix_wp_redirects.txt"

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

WP_DOMAINS = {
    "bhislass.com":    "/home/mayowae/bhislass.com",
    "paxalphaltd.com": "/home/mayowae/paxalphaltd.com",
}

# ─── STEP 1: Diagnose each WP site ───────────────────────────────────────────
banner("STEP 1: Diagnose WordPress redirect issue for bhislass.com and paxalphaltd.com")
for domain, path in WP_DOMAINS.items():
    say(f"\n--- {domain} ---")
    r = run(ssh, f"""
echo "=== wp-config.php HTTPS/SSL settings ==="
grep -iE "(HTTPS|SSL|FORCE_SSL|siteurl|home|HTTP_X_FORWARDED)" {path}/wp-config.php 2>/dev/null | head -20 || echo 'wp-config not found at {path}'

echo ""
echo "=== .htaccess ==="
cat {path}/.htaccess 2>/dev/null | head -30 || echo 'no .htaccess'

echo ""
echo "=== DB siteurl and home ==="
mysql -u root --batch -e "SELECT option_name, option_value FROM wp_options WHERE option_name IN ('siteurl','home');" \\
    $(grep DB_NAME {path}/wp-config.php 2>/dev/null | head -1 | sed "s/.*'\\([^']*\\)'.*/\\1/") 2>/dev/null || \\
echo 'could not query DB directly'

echo ""
echo "=== Checking if WP_HOME/WP_SITEURL defined in wp-config ==="
grep -E "WP_HOME|WP_SITEURL" {path}/wp-config.php 2>/dev/null || echo 'WP_HOME/WP_SITEURL not set in wp-config'
""")
    say(r)

# ─── STEP 2: Check Apache's global HTTPS/SSL environment handling ─────────────
banner("STEP 2: Apache webuzo.conf - X-Forwarded-Proto setup")
say(run(ssh, r"""
grep -A5 -B2 'X-Forwarded-Proto\|HTTPS\|SetEnvIf\|RequestHeader' \
    /usr/local/apps/apache2/etc/conf.d/webuzo.conf 2>/dev/null | head -40
"""))

# ─── STEP 3: Check Apache VirtualHost configs for bhislass & paxalpha ────────
banner("STEP 3: Apache VirtualHost configs for problem domains")
for domain, path in WP_DOMAINS.items():
    say(f"\n--- Apache VH for {domain} ---")
    # Find the VirtualHost config file
    r = run(ssh, f"""
find /usr/local/apps/apache2/etc/ -name '*{domain[:8]}*' 2>/dev/null
grep -rn '{domain}' /usr/local/apps/apache2/etc/ 2>/dev/null | grep -v '.bak' | head -5
""")
    say(r)

# ─── STEP 4: Direct Apache test — does Apache itself redirect to HTTPS? ───────
banner("STEP 4: Test Apache directly on port 8081 for these domains")
for domain in WP_DOMAINS:
    say(f"\n--- Direct Apache test: {domain} ---")
    r = run(ssh,
        f'curl -sv --max-redirs 2 '
        f'-H "Host: {domain}" '
        f'-H "X-Forwarded-Proto: https" '
        f'-H "X-Forwarded-Port: 443" '
        f'http://127.0.0.1:8081/ 2>&1 | grep -E "Location:|< HTTP|> Host|< Set-Cookie" | head -15',
        timeout=20)
    say(r)

# ─── STEP 5: THE FIX ─────────────────────────────────────────────────────────
banner("STEP 5: Fix 1 — Ensure Apache webuzo.conf properly sets HTTPS env var")
say(run(ssh, r"""
WEBUZO_CONF=/usr/local/apps/apache2/etc/conf.d/webuzo.conf

# Check what's currently there
echo "=== Current X-Forwarded lines ==="
grep -n 'X-Forwarded\|HTTPS\|SetEnvIf\|RequestHeader' "$WEBUZO_CONF" | head -20

echo ""
echo "=== First 50 lines of webuzo.conf ==="
head -50 "$WEBUZO_CONF"
"""))

# ─── STEP 6: Fix wp-config.php for both WP sites ─────────────────────────────
banner("STEP 6: Fix wp-config.php — add HTTPS detection before WP loads")
for domain, path in WP_DOMAINS.items():
    say(f"\n--- Fixing wp-config.php for {domain} ---")
    
    WP_FIX = f"""
# Check if already patched
if grep -q 'HTTP_X_FORWARDED_PROTO' {path}/wp-config.php; then
    echo "Already has HTTPS fix"
else
    # Back up
    cp {path}/wp-config.php {path}/wp-config.php.bak.$(date +%s)
    
    # Insert the fix right after <?php line
    sed -i "0,/<?php/s/<?php/<?php\\n\\/\\/ Fix HTTPS behind nginx reverse proxy\\nif (isset(\\$_SERVER['HTTP_X_FORWARDED_PROTO']) \\&\\& \\$_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {{\\n    \\$_SERVER['HTTPS'] = 'on';\\n    \\$_SERVER['SERVER_PORT'] = 443;\\n}}\\n/" {path}/wp-config.php
    echo "HTTPS fix injected into wp-config.php"
fi

echo ""
echo "=== First 20 lines of wp-config.php ==="
head -20 {path}/wp-config.php
"""
    say(run(ssh, WP_FIX))

# ─── STEP 7: Also check and fix .htaccess — remove any HTTPS redirect ────────
banner("STEP 7: Check .htaccess — remove any duplicate HTTPS redirect rules")
for domain, path in WP_DOMAINS.items():
    say(f"\n--- .htaccess for {domain} ---")
    r = run(ssh, f"""
echo "=== Current .htaccess ==="
cat {path}/.htaccess

echo ""
echo "=== Does it have HTTPS redirect? ==="
grep -n 'https\|HTTPS\|ssl\|SSL' {path}/.htaccess 2>/dev/null && echo 'YES - has HTTPS rules' || echo 'No HTTPS rules in .htaccess'
""")
    say(r)

# ─── STEP 8: Reload Apache ────────────────────────────────────────────────────
banner("STEP 8: Reload Apache to apply wp-config changes")
say(run(ssh, r"""
/usr/local/apps/apache2/bin/apachectl configtest 2>&1
echo ""
/usr/local/apps/apache2/bin/apachectl graceful 2>&1 && echo "Apache reloaded OK" || echo "FAILED"
""", timeout=30))

# ─── STEP 9: Test the fixes ───────────────────────────────────────────────────
banner("STEP 9: Re-test the problem domains")
time.sleep(3)
for domain in WP_DOMAINS:
    say(f"\n--- Testing {domain} ---")
    r = run(ssh,
        f'curl -skL --max-redirs 8 '
        f'--resolve "{domain}:443:127.0.0.1" '
        f'-o /dev/null -w "FINAL_HTTP_CODE=%{{http_code}} REDIRECTS=%{{num_redirects}}" '
        f'"https://{domain}/" 2>/dev/null')
    say(r)

ssh.close()
say("\nDone.")

with open(OUT_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"\n✅ Saved to {OUT_FILE}")
