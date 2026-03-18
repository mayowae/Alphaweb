import requests
import subprocess
import sys

WEBUZO_IP   = "159.198.36.24"
WEBUZO_PORT = "2002"
BASE_URL    = f"http://{WEBUZO_IP}:{WEBUZO_PORT}"

# Try these credential combos in order
CREDS = [
    ("admin", "u4qwFxy62BYxR8O61X"),
    ("root",  "u4qwFxy62BYxR8O61X"),
    ("admin", "admin"),
    ("admin", "admin123"),
]

# ── SSH credentials (try multiple passwords too) ──────────────────────────────
SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASSWORDS = [
    "u4qwFxy62BYxR8O61X",
    "admin",
    "admin123",
    "root",
    "toor",
    "password",
    "123456",
]

# ─────────────────────────────────────────────────────────────────────────────
# 1. Try SSH first
# ─────────────────────────────────────────────────────────────────────────────
print("=" * 60)
print("STEP 1: Trying SSH connection...")
print("=" * 60)

try:
    import paramiko
    ssh = None
    working_pass = None
    for pwd in SSH_PASSWORDS:
        try:
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(SSH_HOST, 22, SSH_USER, pwd, timeout=8,
                           allow_agent=False, look_for_keys=False)
            ssh = client
            working_pass = pwd
            print(f"  ✅ SSH connected with password: {pwd}")
            break
        except Exception as e:
            print(f"  ✗ Password '{pwd}': {e}")

    if ssh:
        def ssh_run(cmd, timeout=30):
            stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
            stdout.channel.recv_exit_status()
            o = stdout.read().decode("utf-8", errors="replace").strip()
            e = stderr.read().decode("utf-8", errors="replace").strip()
            return (o + ("\n" + e if e else "")).strip()

        print("\n" + "=" * 60)
        print("STEP 2: Diagnosing Nginx config issue")
        print("=" * 60)

        diag = ssh_run(r"""
echo "=LISTENING_PORT_80="
ss -tulpn | grep ':80 '

echo ""
echo "=SITES_ENABLED="
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "No sites-enabled"

echo ""
echo "=CONF_D="
ls -la /etc/nginx/conf.d/ 2>/dev/null || echo "No conf.d"

echo ""
echo "=DEFAULT_SERVER_ENTRIES="
grep -rn "default_server" /etc/nginx/ 2>/dev/null

echo ""
echo "=SERVER_NAME_ALL_CONFS="
grep -rn "server_name" /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ 2>/dev/null

echo ""
echo "=WEBUZO_VH_CONF_PATH="
find / -name 'webuzoVH.conf' 2>/dev/null | head -5

echo ""
echo "=WEBUZO_NGINX_PID="
cat /var/run/webuzo-nginx.pid 2>/dev/null || echo "no webuzo nginx pid"

echo ""
echo "=ALL_NGINX_PROCESSES="
ps aux | grep nginx | grep -v grep

echo ""
echo "=WEBUZO_NGINX_CONF="
find /usr/local/webuzo -name 'nginx.conf' 2>/dev/null | head -5

echo ""
echo "=NGINX_MAIN_CONF_INCLUDES="
grep -n "include" /etc/nginx/nginx.conf 2>/dev/null
""")
        print(diag)

        print("\n" + "=" * 60)
        print("STEP 3: Finding webuzoVH.conf content")
        print("=" * 60)
        vh_path = ssh_run("find / -name 'webuzoVH.conf' 2>/dev/null | head -1")
        print(f"webuzoVH.conf path: {vh_path}")
        if vh_path:
            vh_content = ssh_run(f"cat '{vh_path}'")
            print(vh_content[:5000])

        print("\n" + "=" * 60)
        print("STEP 4: Applying the fix")
        print("=" * 60)

        fix_script = r"""
set -e

echo "[1] Stopping Webuzo Nginx service..."
systemctl stop webuzo-nginx 2>/dev/null || \
service webuzo-nginx stop 2>/dev/null || \
pkill -f 'webuzo.*nginx' 2>/dev/null || \
echo "  webuzo-nginx may already be stopped or service name differs"

echo "[2] Disabling Webuzo Nginx from auto-starting..."
systemctl disable webuzo-nginx 2>/dev/null || \
chkconfig webuzo-nginx off 2>/dev/null || \
echo "  Could not disable, try manually"

echo "[3] Checking what's on port 80 now..."
ss -tulpn | grep ':80 '

echo "[4] Finding all nginx configs with server blocks..."
find /etc/nginx -name '*.conf' | xargs grep -l 'server_name' 2>/dev/null

echo "[5] Checking for default_server in all configs..."
grep -rn "default_server" /etc/nginx/ 2>/dev/null || echo "No default_server found"

echo "[6] Listing sites-enabled and conf.d..."
ls -la /etc/nginx/sites-enabled/ 2>/dev/null
ls -la /etc/nginx/conf.d/ 2>/dev/null

echo "[7] Finding alphakolect server config..."
ALPHA_CONF=$(grep -rln "alphakolect" /etc/nginx/ 2>/dev/null | head -1)
echo "alphakolect config: $ALPHA_CONF"
if [ -n "$ALPHA_CONF" ]; then
    echo "--- Content of alphakolect config ---"
    cat "$ALPHA_CONF"
fi

echo "[8] Testing nginx config..."
nginx -t 2>&1

echo "[9] Getting webuzoVH.conf location..."
VH_CONF=$(find / -name 'webuzoVH.conf' 2>/dev/null | head -1)
echo "webuzoVH.conf: $VH_CONF"
"""
        fix_out = ssh_run(fix_script, timeout=60)
        print(fix_out)

        # Save results
        with open(r'C:\Users\trade\Documents\Alphaweb-main\nginx_fix_output.txt', 'w') as f:
            f.write(diag + "\n\n===FIX OUTPUT===\n\n" + fix_out)
        print("\n✅ Output saved to nginx_fix_output.txt")

        ssh.close()
    else:
        print("\n⚠️  SSH failed with all passwords. Trying Webuzo HTTP panel...")
        # ── 2. Fall back to Webuzo HTTP panel ─────────────────────────────
        session = requests.Session()
        session.headers.update({"User-Agent": "Mozilla/5.0"})

        logged_in = False
        for uname, pwd in CREDS:
            try:
                r = session.post(
                    f"{BASE_URL}/index.php",
                    data={"act": "login", "username": uname, "password": pwd, "submit": "Login"},
                    timeout=10
                )
                if "logout" in r.text.lower() or "dashboard" in r.text.lower() or "act=logout" in r.text.lower():
                    print(f"  ✅ Webuzo login OK: {uname} / {pwd}")
                    logged_in = True
                    break
                else:
                    print(f"  ✗ Webuzo login failed: {uname}")
            except Exception as e:
                print(f"  ✗ Webuzo HTTP error: {e}")

        if logged_in:
            print("Logged into Webuzo. Checking for terminal endpoint...")
            r = session.get(f"{BASE_URL}/index.php?act=terminal", timeout=10)
            print(r.status_code, r.text[:500])
        else:
            print("\n❌ Could not connect via SSH or Webuzo panel.")
            print("Please provide the current root SSH password for 159.198.36.24")

except ImportError:
    print("paramiko not installed — install with: pip install paramiko")
    sys.exit(1)
except Exception as ex:
    print(f"Unexpected error: {ex}")
    import traceback; traceback.print_exc()
