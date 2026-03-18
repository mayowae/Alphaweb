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

banner("STEP 1: Restoring real Smart School index.php")
print(run(ssh, r"""
BASE="/home/mayowae/godproposescollege.com"
SRC="$BASE/update/smart_school_src"

echo "=== My fake placeholder index.php ==="
head -3 "$BASE/index.php"
echo ""

echo "=== Real Smart School index.php ==="
head -5 "$SRC/index.php"

# Restore the real index.php from smart_school_src
cp "$SRC/index.php" "$BASE/index.php"
echo ""
echo "=== Restored index.php ==="
head -5 "$BASE/index.php"
"""))

banner("STEP 2: Fixing file permissions (root owns files — must be mayowae)")
print(run(ssh, r"""
BASE="/home/mayowae/godproposescollege.com"

echo "Fixing ownership on all files..."
chown -R mayowae:nobody "$BASE" 2>/dev/null
echo "Done. Sample:"
ls -la "$BASE/" | head -8

echo ""
echo "Fixing directory permissions..."
find "$BASE" -type d -exec chmod 755 {} \; 2>/dev/null
find "$BASE" -type f -exec chmod 644 {} \; 2>/dev/null

# Writable dirs for Smart School (uploads, backup, temp)
chmod 755 "$BASE/uploads" 2>/dev/null
find "$BASE/uploads" -type d -exec chmod 755 {} \; 2>/dev/null
find "$BASE/uploads" -type f -exec chmod 644 {} \; 2>/dev/null
chmod 755 "$BASE/backup" 2>/dev/null
chmod 755 "$BASE/temp" 2>/dev/null
echo "Permissions fixed"
"""))

banner("STEP 3: Checking database config")
print(run(ssh, r"""
BASE="/home/mayowae/godproposescollege.com"
DB_CONF="$BASE/application/config/database.php"

echo "=== Database config ==="
if [ -f "$DB_CONF" ]; then
    grep -E "hostname|database|username|password" "$DB_CONF" | grep -v "^//"
else
    # Try alternate location
    find "$BASE" -name 'database.php' 2>/dev/null | head -3
fi
"""))

banner("STEP 4: Removing bad .htaccess I placed — restore from smart_school_src")
print(run(ssh, r"""
BASE="/home/mayowae/godproposescollege.com"
SRC="$BASE/update/smart_school_src"

echo "=== My .htaccess ==="
cat "$BASE/.htaccess"

echo ""
echo "=== Smart School .htaccess from src (if exists) ==="
if [ -f "$SRC/.htaccess" ]; then
    cat "$SRC/.htaccess"
    cp "$SRC/.htaccess" "$BASE/.htaccess"
    echo "Restored .htaccess from smart_school_src"
else
    echo "No .htaccess in smart_school_src — writing standard CodeIgniter one..."
    cat > "$BASE/.htaccess" << 'HTEOF'
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{REQUEST_URI} ^system.*
    RewriteRule ^(.*)$ /index.php/$1 [L]
    RewriteCond %{REQUEST_URI} ^application.*
    RewriteRule ^(.*)$ /index.php/$1 [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php/$1 [L]
</IfModule>
<IfModule !mod_rewrite.c>
    ErrorDocument 404 /index.php
</IfModule>
HTEOF
    echo "Created CodeIgniter .htaccess"
fi
"""))

banner("STEP 5: Test the site via curl")
print(run(ssh, r"""
sleep 2
echo "=== Testing HTTPS godproposescollege.com ==="
curl -skL --max-redirs 5 \
    --resolve "godproposescollege.com:443:127.0.0.1" \
    -o /tmp/godproposes_test.html \
    -w "HTTP final: %{http_code}" \
    "https://godproposescollege.com/" 2>/dev/null
echo ""

echo ""
echo "=== First 20 lines of response ==="
head -20 /tmp/godproposes_test.html 2>/dev/null | cat
"""))

ssh.close()
print("\n✅ Done.")
