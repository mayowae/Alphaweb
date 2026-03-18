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

# ─── STEP 1: Kill ALL Webuzo services completely ─────────────────────────────
banner("STEP 1: Completely removing Webuzo from port 80/443")
print(run(ssh, r"""
echo "[A] Stopping all Webuzo-related services..."
for svc in webuzo webuzo-nginx webuzonginx webuzo_nginx webuzo-php webuzo-fpm; do
    systemctl stop "$svc"    2>/dev/null && echo "  stopped: $svc" || true
    systemctl disable "$svc" 2>/dev/null && echo "  disabled: $svc" || true
done

echo "[B] Killing Webuzo nginx processes..."
# Kill any nginx NOT belonging to system nginx or EMPS nginx
SYSTEM_MASTER=$(cat /run/nginx.pid 2>/dev/null || cat /var/run/nginx.pid 2>/dev/null)
EMPS_MASTER=$(pgrep -f '/usr/local/emps/sbin/nginx' 2>/dev/null | head -1)
ps aux | grep nginx | grep -v grep | while read line; do
    PID=$(echo "$line" | awk '{print $2}')
    CMD=$(cat /proc/$PID/cmdline 2>/dev/null | tr '\0' ' ')
    if echo "$CMD" | grep -q 'webuzo\|apps/nginx'; then
        echo "  Killing webuzo nginx PID $PID: $CMD"
        kill -TERM $PID 2>/dev/null || true
    fi
done
sleep 2

echo "[C] Current processes on port 80/443:"
ss -tulpn | grep ':80 \|:443 '

echo "[D] All nginx processes now:"
ps aux | grep nginx | grep -v grep
""", timeout=30))

# ─── STEP 2: Diagnose Apache backend ──────────────────────────────────────────
banner("STEP 2: Diagnosing Apache backend ports")
apache_diag = run(ssh, r"""
echo "=Apache listening ports="
ss -tulpn | grep httpd

echo ""
echo "=Test 8081 HTTP response for bhislass.com="
curl -s --max-time 5 -o /dev/null -w "HTTP %{http_code}" -H "Host: bhislass.com" http://127.0.0.1:8081/ 2>/dev/null
echo ""

echo "=Test 8082 HTTP response for bhislass.com="
curl -s --max-time 5 -o /dev/null -w "HTTP %{http_code}" -H "Host: bhislass.com" http://127.0.0.1:8082/ 2>/dev/null
echo ""

echo "=Test 8082 HTTPS response for bhislass.com="
curl -sk --max-time 5 -o /dev/null -w "HTTPS %{http_code}" -H "Host: bhislass.com" https://127.0.0.1:8082/ 2>/dev/null
echo ""

echo "=Apache httpd.conf Listen directives="
grep -i "^Listen" /usr/local/apps/apache2/etc/httpd.conf 2>/dev/null

echo "=Apache VirtualHost ports in extra/="
grep -rh "VirtualHost\|ServerName\|SSLEngine" /usr/local/apps/apache2/etc/extra/ 2>/dev/null | head -40

echo "=Location of webuzoVH.conf for Apache="
ls /usr/local/apps/apache2/etc/conf.d/ 2>/dev/null
""", timeout=30)
print(apache_diag)

# Parse: what HTTP code does port 8081 return?
code_8081 = ""
code_8082_http = ""
code_8082_https = ""
for line in apache_diag.split("\n"):
    if "Test 8081" in line and "HTTP" in line:
        code_8081 = line.strip()
    if "Test 8082 HTTP" in line and "HTTP" in line:
        code_8082_http = line.strip()
    if "Test 8082 HTTPS" in line and "HTTPS" in line:
        code_8082_https = line.strip()

# ─── STEP 3: Read Apache webuzoVH config fully ────────────────────────────────
banner("STEP 3: Reading Apache webuzoVH.conf")
apache_vh = run(ssh, "cat /usr/local/apps/apache2/etc/conf.d/webuzoVH.conf 2>/dev/null | head -80")
print(apache_vh[:3000])

# Determine best proxy target based on results
print(f"\n  >>> 8081 HTTP: {code_8081}")
print(f"  >>> 8082 HTTP: {code_8082_http}")
print(f"  >>> 8082 HTTPS: {code_8082_https}")

# ─── STEP 4: Apply the correct nginx configs ──────────────────────────────────
banner("STEP 4: Writing correct nginx configs")

# Build the right proxy_pass depending on what's available
# If 8082 responds via HTTPS → use https://127.0.0.1:8082
# If 8082 responds via HTTP  → use http://127.0.0.1:8082
# If 8081 returns 200/non-301 → use http://127.0.0.1:8081
# Default: try https://127.0.0.1:8082 first

def get_proxy_target():
    # Quick test
    r = run(ssh, 'curl -sk --max-time 3 -o /dev/null -w "%{http_code}" -H "Host: bhislass.com" https://127.0.0.1:8082/ 2>/dev/null')
    if r in ("200", "301", "302", "403"):
        return f"https://127.0.0.1:8082", True   # (target, is_ssl)
    r = run(ssh, 'curl -s --max-time 3 -o /dev/null -w "%{http_code}" -H "Host: bhislass.com" http://127.0.0.1:8082/ 2>/dev/null')
    if r in ("200", "301", "302", "403"):
        return f"http://127.0.0.1:8082", False
    return f"http://127.0.0.1:8081", False

proxy_target, proxy_ssl = get_proxy_target()
print(f"\n  >>> Best proxy target: {proxy_target} (ssl={proxy_ssl})")

BASE_SSL = "/var/webuzo/users/mayowae/ssl"
DHPARAM  = "/etc/ssl/private/dhparam.pem"
DOMAINS  = [
    "bhislass.com", "paxalphaltd.com", "kosheglobal.com",
    "vinemorrisgroup.com", "modoniteintegrated.com.ng",
    "suppakash.com", "godproposescollege.com", "thepeopleimpact.com",
]

ssl_extra = "proxy_ssl_verify off;\n        proxy_ssl_server_name on;" if proxy_ssl else ""

def domain_conf(domain, cert_domain=None):
    cd = cert_domain or domain
    return f"""# {domain}
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
    ssl_certificate     {BASE_SSL}/{cd}-combined.pem;
    ssl_certificate_key {BASE_SSL}/{cd}.key;
    ssl_dhparam         {DHPARAM};
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    location / {{
        proxy_pass         {proxy_target};
        {ssl_extra}
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto https;
        proxy_set_header   X-Forwarded-Port  443;
        proxy_set_header   HTTPS             on;
        proxy_connect_timeout 60s;
        proxy_read_timeout    300s;
    }}
    location /.well-known/ {{ root /var/webuzo-data/www; }}
}}
"""

for domain in DOMAINS:
    conf = domain_conf(domain)
    fname = "bhislass.conf" if domain == "bhislass.com" else f"{domain}.conf"
    result = run(ssh, f"cat > /etc/nginx/conf.d/{fname} << 'EOCONF'\n{conf}\nEOCONF\necho 'Written {fname}'")
    print(result)

# ─── STEP 5: Test nginx then reload ──────────────────────────────────────────
banner("STEP 5: nginx test + reload")
test = run(ssh, "nginx -t 2>&1")
print(test)
if "successful" in test:
    print(run(ssh, "nginx -s reload && echo RELOADED"))
    time.sleep(3)

# ─── STEP 6: HTTP response checks ────────────────────────────────────────────
banner("STEP 6: Domain HTTP response verification")
lines = []
check_domains = DOMAINS + ["alphakolect.com", "unknown-xyz.com"]
for dom in check_domains:
    http  = run(ssh, f'curl -s --max-time 5 -o /dev/null -w "%{{http_code}}" -H "Host: {dom}" http://127.0.0.1/ 2>/dev/null || echo ERR')
    https = run(ssh, f'curl -sk --max-time 5 --resolve "{dom}:443:127.0.0.1" -o /dev/null -w "%{{http_code}}" "https://{dom}/" 2>/dev/null || echo ERR')
    ok    = "✅" if http in ("301","200","302") and https in ("200","301","302") else "⚠️ "
    if dom == "unknown-xyz.com": ok = "🔒" if "000" in http else "❌ LEAK"
    line  = f"  {ok}  {dom:42s}  HTTP={http}  HTTPS={https}"
    lines.append(line)
    print(line)

with open(r"C:\Users\trade\Documents\Alphaweb-main\final_verify.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

ssh.close()
print("\n✅ Done. Results saved to final_verify.txt")
