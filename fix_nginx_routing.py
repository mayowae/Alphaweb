import paramiko
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

# New Nginx Config
new_conf = """
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

    # 1. API prefix handling - strip /api and send to Express
    location /api/ {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 2. Specific backend paths (health, docs, etc)
    location ~ ^/(health|api-docs|superadmin|uploads)(/|$) {
        proxy_pass         http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 3. Everything else goes to Next.js Frontend
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
    }
}
"""

# Backup and write
print("=== Backing up and updating Nginx config ===")
client.exec_command('cp /etc/nginx/conf.d/alphaweb.conf /etc/nginx/conf.d/alphaweb.conf.bak')

with open('alphaweb.conf', 'w', encoding='utf-8') as f:
    f.write(new_conf)

sftp = client.open_sftp()
sftp.put('alphaweb.conf', '/etc/nginx/conf.d/alphaweb.conf')
sftp.close()

# Test and Reload
stdin, stdout, stderr = client.exec_command('nginx -t && systemctl reload nginx')
print("Nginx reload result:", stdout.read().decode('utf-8'), stderr.read().decode('utf-8'))

client.close()
import os
if os.path.exists('alphaweb.conf'):
    os.remove('alphaweb.conf')
