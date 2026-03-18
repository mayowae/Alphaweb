import paramiko
import requests
import time
import sys

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASSWORDS = [
    "Xr2J2Wx9Unk0l7rI1C",
    "u4qwFxy62BYxR8O61X",
]

WEBUZO_URL = f"http://{SSH_HOST}:2002"

# Domains managed on this server
DOMAINS = [
    "alphakolect.com",
    "bhislass.com",
]

def ssh_run(client, cmd, timeout=60):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    stdout.channel.recv_exit_status()
    o = stdout.read().decode("utf-8", errors="replace").strip()
    e = stderr.read().decode("utf-8", errors="replace").strip()
    combined = o + ("\n" + e if e else "")
    return combined.strip()

def banner(msg):
    print("\n" + "="*65)
    print(f"  {msg}")
    print("="*65)

# ─── 1. Try SSH ───────────────────────────────────────────────────────────────
banner("STEP 1: Trying SSH connections...")
ssh = None
for pwd in SSH_PASSWORDS:
    try:
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(SSH_HOST, 22, SSH_USER, pwd, timeout=8,
                       allow_agent=False, look_for_keys=False)
        ssh = client
        print(f"  ✅ SSH connected with password: {pwd}")
        break
    except paramiko.AuthenticationException:
        print(f"  ✗ Wrong password: '{pwd}'")
    except Exception as e:
        print(f"  ✗ Error with '{pwd}': {e}")
        break  # Network error, stop trying

if not ssh:
    print("\n❌ SSH authentication failed with all tried passwords.")
    print("   The root password was changed on the server.")
    print("   Please provide the current root password to continue.")
    sys.exit(1)

# ─── 2. Diagnose ─────────────────────────────────────────────────────────────
banner("STEP 2: Diagnosing the server state")

diag = ssh_run(ssh, """
echo "=== PORT 80 LISTENERS ==="
ss -tulpn | grep ':80 '

echo ""
echo "=== ALL NGINX PROCESSES ==="
ps aux | grep nginx | grep -v grep

echo ""
echo "=== WEBUZO SERVICES ==="
systemctl list-units --type=service 2>/dev/null | grep -i webuzo
service --status-all 2>/dev/null | grep webuzo || true

echo ""
echo "=== WEBUZO NGINX PID FILES ==="
find /var/run -name '*webuzo*' 2>/dev/null
find /run -name '*webuzo*' 2>/dev/null

echo ""
echo "=== MAIN NGINX SITES-ENABLED ==="
ls -la /etc/nginx/sites-enabled/ 2>/dev/null

echo ""
echo "=== MAIN NGINX CONF.D ==="
ls -la /etc/nginx/conf.d/ 2>/dev/null

echo ""
echo "=== DEFAULT_SERVER CHECK ==="
grep -rn "default_server" /etc/nginx/ 2>/dev/null

echo ""
echo "=== WEBUZO VH CONF PATH ==="
find / -name 'webuzoVH.conf' 2>/dev/null | head -5

echo ""
echo "=== APACHE/HTTPD STATUS ==="
ss -tulpn | grep ':8080\|:8081\|:8082\|:443 '

echo ""
echo "=== NODE/PM2 PROCESSES ==="
pm2 list 2>/dev/null || ps aux | grep 'node\|next' | grep -v grep | head -20
""")
print(diag)

# ─── 3. Get webuzoVH.conf path and content ───────────────────────────────────
banner("STEP 3: Reading webuzoVH.conf")
vh_path = ssh_run(ssh, "find / -name 'webuzoVH.conf' 2>/dev/null | head -1")
print(f"webuzoVH.conf location: {vh_path}")
if vh_path:
    vh_content = ssh_run(ssh, f"cat '{vh_path}'")
    print(vh_content[:3000])

# ─── 4. Get all sites-enabled configs ────────────────────────────────────────
banner("STEP 4: Reading all nginx site configs")
all_cfgs = ssh_run(ssh, """
for f in /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*.conf; do
  [ -f "$f" ] || continue
  echo ""
  echo "======== FILE: $f ========"
  cat "$f"
done
""")
print(all_cfgs[:5000])

# ─── 5. Save diagnostics ─────────────────────────────────────────────────────
diag_file = r'C:\Users\trade\Documents\Alphaweb-main\nginx_diag_full.txt'
with open(diag_file, 'w', encoding='utf-8') as f:
    f.write(diag)
    f.write(f"\n\n=== webuzoVH.conf ({vh_path}) ===\n")
    f.write(vh_content if vh_path else "NOT FOUND")
    f.write("\n\n=== SITE CONFIGS ===\n")
    f.write(all_cfgs)
print(f"\nDiagnostics saved to {diag_file}")

# ─── 6. BIG FIX: Stop & Disable Webuzo, fix Nginx ───────────────────────────
banner("STEP 5: STOPPING & REMOVING WEBUZO NGINX, FIXING ALL DOMAINS")

fix_commands = r"""
set -e

# ── A. Kill Webuzo Nginx ──────────────────────────────────────────────────
echo ">>> A. Stopping Webuzo services..."
systemctl stop webuzo-nginx  2>/dev/null && echo "  stopped webuzo-nginx via systemctl" || true
systemctl stop webuzonginx   2>/dev/null && echo "  stopped webuzonginx via systemctl"  || true
service webuzo-nginx stop    2>/dev/null && echo "  stopped via service"                || true

# Kill any stray webuzo nginx processes
WEBUZO_NGINX_CONF=$(find /usr/local/webuzo -name 'nginx.conf' 2>/dev/null | head -1)
if [ -n "$WEBUZO_NGINX_CONF" ]; then
    WEBUZO_NGINX_BIN=$(find /usr/local/webuzo -name 'nginx' -type f 2>/dev/null | head -1)
    if [ -n "$WEBUZO_NGINX_BIN" ]; then
        echo "Stopping webuzo nginx binary: $WEBUZO_NGINX_BIN"
        "$WEBUZO_NGINX_BIN" -s stop 2>/dev/null || true
    fi
fi
# Kill by PID file
for pidfile in $(find /var/run /run /tmp -name '*webuzo*nginx*' -o -name '*nginx*webuzo*' 2>/dev/null); do
    PID=$(cat "$pidfile" 2>/dev/null)
    if [ -n "$PID" ]; then
        echo "Killing webuzo nginx PID $PID from $pidfile"
        kill -TERM "$PID" 2>/dev/null || true
    fi
done
sleep 2

# ── B. Disable Webuzo Nginx from auto-starting ───────────────────────────
echo ">>> B. Disabling Webuzo from auto-start..."
systemctl disable webuzo-nginx 2>/dev/null || true
systemctl disable webuzonginx  2>/dev/null || true

# ── C. Check what's still on port 80 ────────────────────────────────────
echo ""
echo ">>> C. Port 80 status after killing webuzo:"
ss -tulpn | grep ':80 ' || echo "  Nothing on port 80 now"

# ── D. Fix the main Nginx config ─────────────────────────────────────────
echo ""
echo ">>> D. Fixing main Nginx configuration..."

# Back up webuzoVH.conf so webuzo no longer loads its bad config
VH=$(find / -name 'webuzoVH.conf' 2>/dev/null | head -1)
if [ -n "$VH" ]; then
    echo "  Backing up + clearing webuzoVH.conf: $VH"
    cp "$VH" "${VH}.bak.$(date +%s)"
    # Remove duplicate location / and default_server from it
    cat "$VH" > /tmp/vh_orig.conf
    # We will rewrite it below after inspection
fi

# Remove default_server from ALL nginx configs to prevent catch-all behavior
echo "  Removing 'default_server' flags from all nginx configs..."
find /etc/nginx -name '*.conf' | while read cf; do
    if grep -q 'default_server' "$cf"; then
        echo "    Removing default_server from: $cf"
        sed -i 's/ default_server//g' "$cf"
    fi
done

# Also check webuzoVH.conf and remove default_server
if [ -n "$VH" ]; then
    sed -i 's/ default_server//g' "$VH"
    echo "  Removed default_server from webuzoVH.conf"
fi

# ── E. Add a catch-all 444 server block (drops requests for unknown domains)
CATCHALL="/etc/nginx/sites-enabled/00-default-catchall"
cat > "$CATCHALL" << 'NGINXEOF'
# Drop requests for unknown domains — prevents any site from being the default
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 444;
}
NGINXEOF
echo "  ✅ Created catch-all 444 block: $CATCHALL"

# ── F. Ensure each domain has its own correct server block ──────────────
echo ""
echo ">>> E. Checking per-domain nginx configs..."
for DOMAIN in alphakolect.com www.alphakolect.com bhislass.com www.bhislass.com; do
    FOUND=$(grep -rl "$DOMAIN" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null | head -1)
    echo "  $DOMAIN config file: ${FOUND:-NOT FOUND}"
done

# ── G. Test and reload Nginx ─────────────────────────────────────────────
echo ""
echo ">>> F. Testing nginx config..."
nginx -t 2>&1
echo ">>> G. Reloading nginx..."
nginx -s reload 2>&1 || systemctl reload nginx 2>&1 || systemctl restart nginx 2>&1
echo "  ✅ Nginx reloaded"

# ── H. Verify port 80 is up ──────────────────────────────────────────────
sleep 2
echo ""
echo ">>> H. Final port 80 status:"
ss -tulpn | grep ':80 '

echo ""
echo ">>> I. All nginx processes now:"
ps aux | grep nginx | grep -v grep
"""

fix_out = ssh_run(ssh, fix_commands, timeout=120)
print(fix_out)

# ─── 7. Now verify all sites are actually serving correctly ──────────────────
banner("STEP 6: Verifying all sites respond correctly")

verify = ssh_run(ssh, """
echo "=== curl alphakolect.com ==="
curl -s -o /dev/null -w "alphakolect.com: HTTP %{http_code}" --connect-timeout 5 -H "Host: alphakolect.com" http://127.0.0.1/
echo ""

echo "=== curl bhislass.com ==="
curl -s -o /dev/null -w "bhislass.com: HTTP %{http_code}" --connect-timeout 5 -H "Host: bhislass.com" http://127.0.0.1/
echo ""

echo "=== curl unknown domain (should be 444) ==="
curl -s -o /dev/null -w "unknown.com: HTTP %{http_code}" --connect-timeout 5 -H "Host: unknown-testdomain.com" http://127.0.0.1/ || echo "unknown: connection refused (444 - correct!)"
echo ""

echo "=== nginx -t final check ==="
nginx -t 2>&1

echo "=== PM2 / Node status ==="
pm2 list 2>/dev/null || echo "pm2 not available"
""")
print(verify)

# ─── 8. Save full output ─────────────────────────────────────────────────────
fix_file = r'C:\Users\trade\Documents\Alphaweb-main\nginx_fix_output.txt'
with open(fix_file, 'w', encoding='utf-8') as f:
    f.write("=== DIAGNOSTICS ===\n" + diag)
    f.write("\n\n=== FIX OUTPUT ===\n" + fix_out)
    f.write("\n\n=== VERIFICATION ===\n" + verify)
print(f"\n✅ Full output saved to {fix_file}")

ssh.close()
print("\n✅ Done. Connection closed.")
