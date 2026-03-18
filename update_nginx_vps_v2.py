import paramiko

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"

def run(ssh, cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    o = stdout.read().decode("utf-8", errors="replace")
    e = stderr.read().decode("utf-8", errors="replace")
    return (o + e).strip()

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, 22, SSH_USER, SSH_PASS)

new_nginx = """
server {
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

    # 1. Non-clashing Backend API paths
    location ~ ^/(api|health|api-docs|branches|roles|staff|charges|investments|investment-applications|investment-transactions|loan-applications|loans|repayments|packages|collections|wallet|wallet-tiers|remittances|customer-wallets|accounting|uploads)(/|$) {
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

    # 2. Clashing paths (Pages vs APIs) -- use Accept header to distinguish
    # These paths exist in BOTH the Next.js frontend and Express backend.
    location ~ ^/(merchant|collaborator|superadmin|dashboard|agents|customers)(/|$) {
        # Browser page requests (HTML) -> Next.js on 3000
        if ($http_accept ~* "text/html") {
            proxy_pass http://127.0.0.1:3000;
            break;
        }
        # API/AJAX requests -> Express on 5000
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

    # 3. Everything else -- Next.js frontend on port 3000
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

with open("alphaweb_v3.conf", "w") as f:
    f.write(new_nginx)

# Upload and restart nginx
sftp = ssh.open_sftp()
sftp.put("alphaweb_v3.conf", "/tmp/alphaweb_v3.conf")
run(ssh, "mv /tmp/alphaweb_v3.conf /etc/nginx/conf.d/alphaweb.conf")
print(run(ssh, "nginx -t"))
print(run(ssh, "systemctl reload nginx"))

ssh.close()
