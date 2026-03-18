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

# ─── STEP 1: Fix nginx domain configs — proxy to Apache HTTP 8081 ─────────────
banner("STEP 1: Switching all nginx domain configs to http://127.0.0.1:8081")

BASE_SSL = "/var/webuzo/users/mayowae/ssl"
DHPARAM  = "/etc/ssl/private/dhparam.pem"
DOMAINS  = [
    "bhislass.com", "paxalphaltd.com", "kosheglobal.com",
    "vinemorrisgroup.com", "modoniteintegrated.com.ng",
    "suppakash.com", "godproposescollege.com", "thepeopleimpact.com",
]

def domain_conf(domain):
    return f"""# {domain} — SSL at nginx, backend: Apache HTTP 8081
server {{
    listen 80;
    listen [::]:80;
    server_name {domain} www.{domain};
    location /.well-known/acme-challenge/ {{ root /var/webuzo-data/www; }}
    location / {{ return 301 https://{domain}$request_uri; }}
}}

server {{
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name {domain} www.{domain};

    ssl_certificate     {BASE_SSL}/{domain}-combined.pem;
    ssl_certificate_key {BASE_SSL}/{domain}.key;
    ssl_dhparam         {DHPARAM};
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_session_cache   shared:SSL:10m;

    location / {{
        proxy_pass         http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto https;
        proxy_set_header   X-Forwarded-Port  443;
        proxy_connect_timeout 60s;
        proxy_read_timeout    300s;
    }}
    location /.well-known/ {{ root /var/webuzo-data/www; }}
}}
"""

for domain in DOMAINS:
    fname = "bhislass.conf" if domain == "bhislass.com" else f"{domain}.conf"
    conf = domain_conf(domain)
    r = run(ssh, f"cat > /etc/nginx/conf.d/{fname} << 'EOCONF'\n{conf}\nEOCONF\necho 'OK: {fname}'")
    print(r)

# ─── STEP 2: Fix Apache — recognize X-Forwarded-Proto: https ─────────────────
banner("STEP 2: Fixing Apache to honour X-Forwarded-Proto (stop redirect loop)")

# The global fix: SetEnvIf in Apache's webuzo.conf so ALL VirtualHosts on 8081
# set HTTPS=on when the proxy sends X-Forwarded-Proto: https
print(run(ssh, r"""
WEBUZO_CONF=/usr/local/apps/apache2/etc/conf.d/webuzo.conf

echo "Backing up webuzo.conf..."
cp "$WEBUZO_CONF" "${WEBUZO_CONF}.bak.$(date +%s)"

# Check if already patched
if grep -q "X-Forwarded-Proto" "$WEBUZO_CONF"; then
    echo "Already patched — skipping"
else
    echo "Adding X-Forwarded-Proto handler to webuzo.conf..."
    # Insert the SetEnvIf directive right after the opening of the <VirtualHost *:8081> block
    # Add it BEFORE the first Listen 8081 directive as a global directive
    sed -i '/^Listen 8081/a\
\
# Trust nginx reverse proxy HTTPS header\
SetEnvIf X-Forwarded-Proto "https" HTTPS=on\
RequestHeader set HTTPS "on" env=HTTPS\
RequestHeader set X-Forwarded-Proto "https" env=HTTPS' "$WEBUZO_CONF"
    echo "Done patching"
fi

echo ""
echo "=== Patched webuzo.conf top (first 30 lines) ==="
head -30 "$WEBUZO_CONF"
"""))

# ─── STEP 3: Reload Apache ────────────────────────────────────────────────────
banner("STEP 3: Testing and reloading Apache")
print(run(ssh, r"""
/usr/local/apps/apache2/bin/apachectl configtest 2>&1
echo ""
echo "Reloading Apache..."
/usr/local/apps/apache2/bin/apachectl graceful 2>&1 && echo "Apache reloaded OK" || echo "Apache reload FAILED"
""", timeout=30))

# ─── STEP 4: Test and reload nginx ───────────────────────────────────────────
banner("STEP 4: Test and reload nginx")
test = run(ssh, "nginx -t 2>&1")
print(test)
if "successful" in test:
    print(run(ssh, "nginx -s reload && echo 'nginx reloaded OK'"))
    time.sleep(3)

# ─── STEP 5: Verify all domains ──────────────────────────────────────────────
banner("STEP 5: Final domain verification (with redirect following)")
DOMAINS_ALL = ["alphakolect.com", "bhislass.com", "paxalphaltd.com",
               "kosheglobal.com", "vinemorrisgroup.com",
               "modoniteintegrated.com.ng", "suppakash.com",
               "godproposescollege.com", "thepeopleimpact.com", "unknown-xyz.com"]

results = []
for dom in DOMAINS_ALL:
    # Follow redirects, check final HTTP code
    final = run(ssh,
        f'curl -skL --max-redirs 5 '
        f'--resolve "{dom}:443:127.0.0.1" '
        f'--resolve "www.{dom}:443:127.0.0.1" '
        f'-o /dev/null -w "%{{http_code}}" '
        f'"https://{dom}/" 2>/dev/null || echo ERR')
    http = run(ssh,
        f'curl -s -o /dev/null -w "%{{http_code}}" '
        f'-H "Host: {dom}" http://127.0.0.1/ 2>/dev/null || echo ERR')

    if dom == "unknown-xyz.com":
        status = "🔒 BLOCKED" if "000" in http else "❌ LEAK"
    else:
        status = "✅" if final in ("200","201","202") else ("⚠️ " if final in ("301","302","403") else "❌")
    line = f"  {status}  {dom:42s}  HTTP={http}  HTTPS_FINAL={final}"
    results.append(line)
    print(line)

# Save results
with open(r"C:\Users\trade\Documents\Alphaweb-main\final_verify.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(results))
print("\nSaved to final_verify.txt")

ssh.close()
print("✅ Done.")
