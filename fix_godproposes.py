import paramiko, time

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"

def run(ssh, cmd, timeout=30):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    stdout.channel.recv_exit_status()
    o = stdout.read().decode("utf-8", errors="replace").strip()
    e = stderr.read().decode("utf-8", errors="replace").strip()
    return (o + ("\n" + e if e else "")).strip()

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, 22, SSH_USER, SSH_PASS, timeout=10, allow_agent=False, look_for_keys=False)
print("✅ Connected")

# Full redirect trace with Location header visible
print("\n=== Trace godproposescollege.com ===")
print(run(ssh, r"""
echo "=Files in docroot="
ls -la /home/mayowae/godproposescollege.com/

echo ""
echo "=Apache 8081 raw response="
curl -s --max-time 5 -D - -o /dev/null \
    -H "Host: godproposescollege.com" \
    -H "X-Forwarded-Proto: https" \
    -H "X-Forwarded-Port: 443" \
    http://127.0.0.1:8081/ 2>/dev/null | head -10

echo ""
echo "=Apache VH for godproposescollege on 8081="
awk '/<VirtualHost [^>]*8081>/{v=1} v && /godproposescollege/{print NR": "p; found=1} v && found{print NR": "$0; if(/<\/VirtualHost>/) {found=0; v=0}}' \
    /usr/local/apps/apache2/etc/conf.d/webuzoVH.conf 2>/dev/null | head -40

echo ""
echo "=Grep all godproposescollege in Apache conf="
grep -n "godproposescollege\|Redirect\|RewriteRule" \
    /usr/local/apps/apache2/etc/conf.d/webuzoVH.conf 2>/dev/null | grep -A2 -B2 "godproposescollege" | head -30

echo ""
echo "=Test index.php content="
cat /home/mayowae/godproposescollege.com/index.php | head -5
"""))

# Check if the Apache VH for port 8081 godproposescollege has redirect
print("\n=== Direct Apache 8081 query with -v ===")
print(run(ssh, r"""
curl -v --max-time 5 \
    -H "Host: godproposescollege.com" \
    -H "X-Forwarded-Proto: https" \
    -H "HTTPS: on" \
    http://127.0.0.1:8081/ 2>&1 | head -30
"""))

# Try passing the placeholder through a different approach
print("\n=== Fix: Add .htaccess to prevent any redirect ===")
print(run(ssh, r"""
DOCROOT="/home/mayowae/godproposescollege.com"
cat > "$DOCROOT/.htaccess" << 'HTEOF'
# Disable all redirects - placeholder page
Options -Indexes
DirectoryIndex index.php
RewriteEngine Off
HTEOF
chown mayowae:nobody "$DOCROOT/.htaccess"
chmod 644 "$DOCROOT/.htaccess"
echo "Created .htaccess"

echo ""
echo "=Re-test Apache 8081="
curl -s --max-time 5 -D - -o /dev/null \
    -H "Host: godproposescollege.com" \
    -H "X-Forwarded-Proto: https" \
    http://127.0.0.1:8081/ 2>/dev/null | head -8

echo ""
echo "=Final HTTPS test="
sleep 1
curl -skL --max-redirs 5 \
    --resolve "godproposescollege.com:443:127.0.0.1" \
    -o /dev/null -w "Status: %{http_code}" \
    "https://godproposescollege.com/" 2>/dev/null
echo ""
"""))

ssh.close()
print("\nDone.")
