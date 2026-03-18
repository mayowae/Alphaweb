import paramiko
import time

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"

def run(ssh, cmd, timeout=60):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    stdout.channel.recv_exit_status()
    o = stdout.read().decode("utf-8", errors="replace").strip()
    e = stderr.read().decode("utf-8", errors="replace").strip()
    return (o + ("\n" + e if e else "")).strip()

def banner(msg):
    print(f"\n{'='*65}\n  {msg}\n{'='*65}")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, 22, SSH_USER, SSH_PASS, timeout=10, allow_agent=False, look_for_keys=False)
print("✅ SSH Connected")

# ─── Verify Apache ports ──────────────────────────────────────────────────────
banner("Checking actual Apache ports")
print(run(ssh, """
echo "=Apache httpd ports="
ss -tulpn | grep httpd
echo ""
echo "=Test port 8081 (Apache HTTP)="
curl -s -o /dev/null -w "HTTP %{http_code}" --connect-timeout 3 http://127.0.0.1:8081/ -H "Host: bhislass.com" 2>/dev/null || echo "FAIL"
echo ""
echo "=Test port 8082 (maybe Apache HTTPS)="
curl -sk -o /dev/null -w "HTTP %{http_code}" --connect-timeout 3 https://127.0.0.1:8082/ -H "Host: bhislass.com" 2>/dev/null \
  || curl -s -o /dev/null -w "HTTP %{http_code}" --connect-timeout 3 http://127.0.0.1:8082/ -H "Host: bhislass.com" 2>/dev/null || echo "FAIL"
"""))

# ─── All Webuzo-managed domains ───────────────────────────────────────────────
WEBUZO_DOMAINS = [
    "paxalphaltd.com",
    "kosheglobal.com",
    "vinemorrisgroup.com",
    "modoniteintegrated.com.ng",
    "suppakash.com",
    "godproposescollege.com",
    "thepeopleimpact.com",
]
BASE_SSL = "/var/webuzo/users/mayowae/ssl"
DHPARAM  = "/etc/ssl/private/dhparam.pem"

# ─── Template: System nginx → Apache 8081 (HTTP backend, SSL terminates at nginx)
def make_conf(domain):
    return f"""# {domain} — SSL at nginx, backend: Apache HTTP 8081
server {{
    listen 80;
    listen [::]:80;
    server_name {domain} www.{domain};
    location /.well-known/acme-challenge/ {{
        root /var/webuzo-data/www;
    }}
    location / {{
        return 301 https://{domain}$request_uri;
    }}
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
    ssl_session_timeout 10m;

    # Backend: Apache httpd on port 8081 (HTTP, SSL terminates here)
    location / {{
        proxy_pass         http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto https;
        proxy_set_header   X-Forwarded-Port  443;
        proxy_set_header   HTTPS             on;
        proxy_connect_timeout 60s;
        proxy_send_timeout    60s;
        proxy_read_timeout    300s;
    }}
    location /.well-known/ {{
        root /var/webuzo-data/www;
    }}
}}
"""

# ─── Write configs for all Webuzo domains ────────────────────────────────────
banner("Writing corrected nginx configs (Apache port 8081)")
for domain in WEBUZO_DOMAINS:
    conf = make_conf(domain)
    cmd = f"cat > '/etc/nginx/conf.d/{domain}.conf' << 'EOCONF'\n{conf}\nEOCONF\necho 'Written: {domain}.conf'"
    print(run(ssh, cmd))

# ─── Fix bhislass.conf ───────────────────────────────────────────────────────
banner("Rewriting bhislass.conf")
bhislass = make_conf("bhislass.com").replace(
    f"{BASE_SSL}/bhislass.com-combined.pem",
    "/var/webuzo/users/mayowae/ssl/bhislass.com-combined.pem"
)
print(run(ssh, f"cat > /etc/nginx/conf.d/bhislass.conf << 'EOCONF'\n{bhislass}\nEOCONF\necho 'bhislass.conf updated'"))

# ─── Test and reload ──────────────────────────────────────────────────────────
banner("Testing and reloading nginx")
test = run(ssh, "nginx -t 2>&1")
print(test)

if "test is successful" in test:
    print(run(ssh, "nginx -s reload && echo 'RELOADED' || systemctl reload nginx"))
    time.sleep(3)

    # ─── Verify all domains ───────────────────────────────────────────────────
    banner("Final domain verification (HTTP response codes)")
    domains = [
        "alphakolect.com",
        "bhislass.com",
        "paxalphaltd.com",
        "kosheglobal.com",
        "vinemorrisgroup.com",
        "modoniteintegrated.com.ng",
        "suppakash.com",
        "godproposescollege.com",
        "thepeopleimpact.com",
        "unknown-xyz-test.com",
    ]
    lines = []
    for dom in domains:
        http = run(ssh, f'curl -s -o /dev/null -w "%{{http_code}}" --connect-timeout 5 -H "Host: {dom}" http://127.0.0.1/ 2>/dev/null || echo ERR')
        https= run(ssh, f'curl -sk --resolve "{dom}:443:127.0.0.1" -o /dev/null -w "%{{http_code}}" --connect-timeout 5 "https://{dom}/" 2>/dev/null || echo ERR')
        if dom == "unknown-xyz-test.com":
            status = "✅ BLOCKED" if "000" in http or "444" in http else "❌ LEAKING"
        else:
            ok_h = http in ("301","200","302")
            ok_s = https in ("200","301","302")
            status = "✅" if ok_h and ok_s else ("⚠️ " if ok_h or ok_s else "❌")
        line = f"  {status}  {dom:42s}  HTTP={http}  HTTPS={https}"
        lines.append(line)
        print(line)

    with open(r"C:\Users\trade\Documents\Alphaweb-main\final_verify.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print("\nResults saved to final_verify.txt")
else:
    banner("❌ nginx config error - NOT reloaded")
    print(test)

ssh.close()
print("\n✅ Done.")
