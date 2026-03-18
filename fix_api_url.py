import paramiko, time

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"
OUT_FILE = r"C:\Users\trade\Documents\Alphaweb-main\fix_api_url.txt"

def run(ssh, cmd, timeout=120):
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

# ─── STEP 1: Check current live alphaweb.conf on VPS ─────────────────────────
banner("STEP 1: Current alphaweb nginx config on VPS")
say(run(ssh, "cat /etc/nginx/conf.d/alphaweb.conf"))

# ─── STEP 2: Update nginx alphaweb.conf — route ALL backend paths to :5000 ───
banner("STEP 2: Update nginx alphaweb.conf — full backend routing + fix .env")
NEW_CONF = r"""server {
    listen 80;
    listen [::]:80;
    server_name alphakolect.com www.alphakolect.com;
    location /.well-known/acme-challenge/ { root /var/webuzo-data/www; }
    location / { return 301 https://alphakolect.com$request_uri; }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name alphakolect.com www.alphakolect.com;

    ssl_certificate     /etc/nginx/ssl/alphakolect.com.crt;
    ssl_certificate_key /etc/nginx/ssl/alphakolect.com.key;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_session_cache   shared:SSL:10m;

    client_max_body_size 50M;

    # Backend API — all non-frontend paths go to Express on port 5000
    location ~ ^/(api|health|api-docs|merchant|collaborator|superadmin|agents|branches|customers|roles|staff|charges|investments|investment-applications|investment-transactions|loan-applications|loans|repayments|packages|collections|wallet|wallet-tiers|remittances|customer-wallets|dashboard|accounting|uploads)(/|$) {
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Everything else → Next.js frontend on port 3000
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
"""
# Write the new nginx config
write_cmd = f"cat > /etc/nginx/conf.d/alphaweb.conf << 'NGINX_EOF'\n{NEW_CONF}\nNGINX_EOF\necho 'Written OK'"
say(run(ssh, write_cmd))

# ─── STEP 3: Test and reload nginx ───────────────────────────────────────────
banner("STEP 3: Test and reload nginx")
test = run(ssh, "nginx -t 2>&1")
say(test)
if "successful" in test:
    say(run(ssh, "nginx -s reload && echo 'nginx reloaded OK'"))
else:
    say("ERROR: nginx config test failed — not reloading")

# ─── STEP 4: Fix .env on VPS ────────────────────────────────────────────────
banner("STEP 4: Fix NEXT_PUBLIC_API_URL in .env on VPS")
PROJ = "/root/Alphaweb-main"
say(run(ssh, f"""
cd {PROJ} 2>/dev/null || cd /home/mayowae/alphaweb 2>/dev/null || {{ echo 'Project dir not found'; exit 1; }}
pwd
echo ""
echo "=== Current .env ==="
cat .env 2>/dev/null | grep -i api_url || echo 'no .env or no API_URL'
"""))

say(run(ssh, f"""
# Find the actual project directory
for dir in /root/Alphaweb-main /home/mayowae/alphaweb /var/www/alphaweb /home/mayowae/alphakolect.com; do
    if [ -f "$dir/.env" ] || [ -f "$dir/package.json" ]; then
        echo "Found at: $dir"
        PROJ="$dir"
        break
    fi
done

if [ -z "$PROJ" ]; then
    echo "Could not find project dir"
    exit 1
fi

echo "Project dir: $PROJ"
cat "$PROJ/.env" 2>/dev/null | grep -E 'API_URL|PORT' | head -10
"""))

# ─── STEP 5: Find and update the live .env on VPS ────────────────────────────
banner("STEP 5: Update .env on VPS and rebuild Next.js")
say(run(ssh, r"""
# Find the project
PROJ=""
for dir in /root/Alphaweb-main /home/mayowae/alphaweb /var/www/alphaweb /home/mayowae/alphakolect.com /root/alphaweb; do
    if [ -f "$dir/.env" ]; then
        PROJ="$dir"
        break
    fi
done

if [ -z "$PROJ" ]; then
    echo "Project .env not found on VPS — check manually"
    exit 1
fi

echo "Found project at: $PROJ"

# Backup current .env
cp "$PROJ/.env" "$PROJ/.env.bak.$(date +%s)"
echo "Backed up .env"

# Fix the NEXT_PUBLIC_API_URL — remove :8082, set to https://alphakolect.com
sed -i 's|NEXT_PUBLIC_API_URL=.*8082.*|NEXT_PUBLIC_API_URL=https://alphakolect.com|g' "$PROJ/.env"
sed -i 's|NEXT_PUBLIC_API_URL=http://localhost:5000|# NEXT_PUBLIC_API_URL=http://localhost:5000 (dev only)|g' "$PROJ/.env"

echo ""
echo "=== Updated .env (API_URL lines) ==="
grep -E 'API_URL|PORT' "$PROJ/.env" | head -10
"""))

# ─── STEP 6: Check PM2 processes ───────────────────────────────────────────
banner("STEP 6: Current PM2 processes")
say(run(ssh, "pm2 list 2>/dev/null || echo 'pm2 not found'"))

# ─── STEP 7: Find project and rebuild ────────────────────────────────────────
banner("STEP 7: Rebuild Next.js with correct NEXT_PUBLIC_API_URL")
say(run(ssh, r"""
PROJ=""
for dir in /root/Alphaweb-main /home/mayowae/alphaweb /var/www/alphaweb /home/mayowae/alphakolect.com /root/alphaweb; do
    if [ -f "$dir/package.json" ] && grep -q 'next' "$dir/package.json" 2>/dev/null; then
        PROJ="$dir"
        break
    fi
done

if [ -z "$PROJ" ]; then
    echo "Next.js project not found — skipping rebuild. Update manually."
    exit 0
fi

echo "Project: $PROJ"
echo "NEXT_PUBLIC_API_URL in .env:"
grep NEXT_PUBLIC_API_URL "$PROJ/.env"

echo ""
echo "Starting build..."
cd "$PROJ"
NEXT_PUBLIC_API_URL=https://alphakolect.com npm run build 2>&1 | tail -30
""", timeout=300))

# ─── STEP 8: Restart Next.js via PM2 ─────────────────────────────────────────
banner("STEP 8: Restart Next.js frontend via PM2")
say(run(ssh, r"""
PROJ=""
for dir in /root/Alphaweb-main /home/mayowae/alphaweb /var/www/alphaweb /home/mayowae/alphakolect.com /root/alphaweb; do
    if [ -f "$dir/package.json" ] && grep -q 'next' "$dir/package.json" 2>/dev/null; then
        PROJ="$dir"
        break
    fi
done

# Restart Next.js process(es) in PM2
pm2 list 2>/dev/null
echo ""
# Try to restart by name - common names
for name in alphaweb frontend nextjs next alphakolect; do
    pm2 restart "$name" 2>/dev/null && echo "Restarted PM2: $name" && break
done

# If ecosystem.config.js exists, use it
if [ -f "$PROJ/ecosystem.config.js" ]; then
    echo "Restarting via ecosystem.config.js..."
    cd "$PROJ"
    pm2 reload ecosystem.config.js 2>&1 | tail -10
fi

echo ""
echo "=== PM2 status after restart ==="
pm2 list 2>/dev/null
""", timeout=60))

# ─── STEP 9: Quick verify ────────────────────────────────────────────────────
banner("STEP 9: Quick verification — test alphakolect.com API endpoint")
time.sleep(3)
say(run(ssh, r"""
echo "=== Test /health endpoint ==="
curl -sk --resolve 'alphakolect.com:443:127.0.0.1' \
    https://alphakolect.com/health 2>/dev/null

echo ""
echo "=== Test /merchant/login endpoint (should get JSON, not port error) ==="
curl -sk --resolve 'alphakolect.com:443:127.0.0.1' \
    -X POST \
    -H 'Content-Type: application/json' \
    -d '{"email":"test@test.com","password":"test"}' \
    https://alphakolect.com/merchant/login 2>/dev/null | head -c 200
"""))

ssh.close()
say("\nDone.")

with open(OUT_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"\n✅ Saved to {OUT_FILE}")
