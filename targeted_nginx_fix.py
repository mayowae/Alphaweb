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
ssh.connect(SSH_HOST, 22, SSH_USER, SSH_PASS, timeout=10,
            allow_agent=False, look_for_keys=False)
print("✅ SSH Connected")

# ─── Read current configs to understand what's already there ─────────────────
banner("Reading existing configs")
print(run(ssh, "cat /etc/nginx/conf.d/alphaweb.conf 2>/dev/null || echo 'NOT FOUND'"))
print("---")
print(run(ssh, "cat /etc/nginx/conf.d/bhislass.conf 2>/dev/null || echo 'NOT FOUND'"))

# ─── Kill Webuzo nginx (not system nginx) ────────────────────────────────────
banner("Stopping Webuzo nginx process")
print(run(ssh, r"""
# Webuzo nginx binary is different from system nginx
WEBUZO_NGINX=$(find /usr/local/apps/nginx -name 'nginx' -type f 2>/dev/null | head -1)
echo "Webuzo nginx binary: $WEBUZO_NGINX"
if [ -n "$WEBUZO_NGINX" ]; then
    "$WEBUZO_NGINX" -s stop 2>/dev/null && echo "Stopped webuzo nginx" || echo "Already stopped"
fi

# Kill by process matching webuzo nginx config path
WEBUZO_MASTER=$(ps aux | grep 'nginx.*webuzo\|webuzo.*nginx' | grep -v grep | awk '{print $2}' | head -1)
if [ -n "$WEBUZO_MASTER" ]; then
    echo "Killing webuzo nginx process: $WEBUZO_MASTER"
    kill -QUIT "$WEBUZO_MASTER" 2>/dev/null || true
fi

# Disable webuzo nginx from autostart
systemctl stop webuzo-nginx 2>/dev/null || true
systemctl disable webuzo-nginx 2>/dev/null || true

# Show remaining nginx processes
echo "Remaining nginx processes:"
ps aux | grep nginx | grep -v grep
"""))

# ─── Create the proxy params file for system nginx ───────────────────────────
banner("Creating proxy params file")
proxy_params = """proxy_http_version 1.1;
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header Connection "";
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
proxy_buffering off;
"""
print(run(ssh, f"cat > /etc/nginx/proxy_params << 'EOPROXY'\n{proxy_params}\nEOPROXY\necho 'proxy_params created'"))

# ─── Create domain configs ────────────────────────────────────────────────────
# Domains that use Webuzo's Apache httpd (port 8084 HTTPS / 8083 HTTP)
# SSL certs are at /var/webuzo/users/mayowae/ssl/<domain>-combined.pem
WEBUZO_DOMAINS = [
    "paxalphaltd.com",
    "kosheglobal.com",
    "vinemorrisgroup.com",
    "modoniteintegrated.com.ng",
    "suppakash.com",
    "godproposescollege.com",
    "thepeopleimpact.com",
]

DHPARAM = "/etc/ssl/private/dhparam.pem"
BASE_SSL = "/var/webuzo/users/mayowae/ssl"

def make_webuzo_domain_conf(domain):
    """Standard config: HTTP -> HTTPS redirect, HTTPS -> Apache 8084"""
    return f"""# {domain} - managed by system nginx, backend: Webuzo Apache (8084)
server {{
    listen 80;
    listen [::]:80;
    server_name {domain} www.{domain};

    # Allow ACME challenges
    location /.well-known/acme-challenge/ {{
        root /var/webuzo-data/www;
    }}

    # Redirect all other HTTP to HTTPS
    location / {{
        return 301 https://{domain}$request_uri;
    }}
}}

server {{
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name {domain} www.{domain};

    ssl_certificate      {BASE_SSL}/{domain}-combined.pem;
    ssl_certificate_key  {BASE_SSL}/{domain}.key;
    ssl_dhparam          {DHPARAM};
    ssl_protocols        TLSv1.2 TLSv1.3;
    ssl_ciphers          HIGH:!aNULL:!MD5;

    # Proxy to Webuzo Apache HTTPS backend
    location / {{
        include /etc/nginx/proxy_params;
        proxy_ssl_verify off;
        proxy_ssl_server_name on;
        proxy_ssl_name {domain};
        proxy_pass https://127.0.0.1:8084;
    }}

    # ACME challenges
    location /.well-known/ {{
        root /var/webuzo-data/www;
    }}
}}
"""

banner("Writing nginx configs for Webuzo domains")
for domain in WEBUZO_DOMAINS:
    conf_content = make_webuzo_domain_conf(domain)
    conf_path = f"/etc/nginx/conf.d/{domain}.conf"
    # Use heredoc to write the conf
    write_cmd = f"cat > '{conf_path}' << 'EOCONF'\n{conf_content}\nEOCONF\necho 'Written: {conf_path}'"
    result = run(ssh, write_cmd)
    print(result)

# ─── Fix bhislass.conf (update it to match the proper system nginx format) ────
banner("Rewriting bhislass.conf")
bhislass_conf = """# bhislass.com - managed by system nginx, backend: Webuzo Apache (8084)
server {
    listen 80;
    listen [::]:80;
    server_name bhislass.com www.bhislass.com;

    location /.well-known/acme-challenge/ {
        root /var/webuzo-data/www;
    }

    location / {
        return 301 https://bhislass.com$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name bhislass.com www.bhislass.com;

    ssl_certificate      /var/webuzo/users/mayowae/ssl/bhislass.com-combined.pem;
    ssl_certificate_key  /var/webuzo/users/mayowae/ssl/bhislass.com.key;
    ssl_dhparam          /etc/ssl/private/dhparam.pem;
    ssl_protocols        TLSv1.2 TLSv1.3;
    ssl_ciphers          HIGH:!aNULL:!MD5;

    location / {
        include /etc/nginx/proxy_params;
        proxy_ssl_verify off;
        proxy_ssl_server_name on;
        proxy_ssl_name bhislass.com;
        proxy_pass https://127.0.0.1:8084;
    }

    location /.well-known/ {
        root /var/webuzo-data/www;
    }
}
"""
print(run(ssh, f"cat > /etc/nginx/conf.d/bhislass.conf << 'EOCONF'\n{bhislass_conf}\nEOCONF\necho 'bhislass.conf rewritten'"))

# ─── Add catch-all default server (drops unknown domains with 444) ─────────────
banner("Adding catch-all 444 default server block")
catchall = """# Catch-all: reject requests for unknown domains
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 444;
}

server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    server_name _;
    ssl_certificate      /var/webuzo/certs/webuzo-combined.pem;
    ssl_certificate_key  /var/webuzo/certs/webuzo.key;
    return 444;
}
"""
print(run(ssh, f"cat > /etc/nginx/conf.d/00-catchall.conf << 'EOCONF'\n{catchall}\nEOCONF\necho '00-catchall.conf created'"))

# ─── Test nginx config ────────────────────────────────────────────────────────
banner("Testing nginx configuration")
test_result = run(ssh, "nginx -t 2>&1")
print(test_result)

if "syntax is ok" in test_result and "test is successful" in test_result:
    banner("Reloading nginx")
    reload_result = run(ssh, "nginx -s reload 2>&1 && echo 'RELOAD OK' || systemctl reload nginx 2>&1")
    print(reload_result)
    time.sleep(3)

    # ─── Verify all domains ───────────────────────────────────────────────────
    banner("Verifying all domains")
    all_domains = ["alphakolect.com", "bhislass.com"] + WEBUZO_DOMAINS + ["unknown-test-xyz.com"]
    for dom in all_domains:
        result = run(ssh, f'curl -s -o /dev/null -w "%{{http_code}}" --connect-timeout 5 '
                          f'-H "Host: {dom}" http://127.0.0.1/ 2>/dev/null || echo "ERR"')
        result_https = run(ssh, f'curl -s -o /dev/null -w "%{{http_code}}" --connect-timeout 5 -k '
                                f'--resolve "{dom}:443:127.0.0.1" "https://{dom}/" 2>/dev/null || echo "ERR"')
        print(f"  {dom:40s}  HTTP={result}  HTTPS={result_https}")
else:
    banner("⚠️  NGINX CONFIG TEST FAILED - rolling back")
    print("Errors in nginx config — no reload performed.")
    print(test_result)

banner("Final nginx process state")
print(run(ssh, "ps aux | grep nginx | grep -v grep"))
print()
print(run(ssh, "ss -tulpn | grep ':80\|:443 '"))

banner("PM2 status")
print(run(ssh, "pm2 list"))

ssh.close()
print("\n✅ Done. SSH connection closed.")
