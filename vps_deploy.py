import paramiko
import time

def run_remote_command(ssh, command):
    print(f"Running: {command}")
    stdin, stdout, stderr = ssh.exec_command(command)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out: print(f"OUT: {out}")
    if err: print(f"ERR: {err}")
    return out, err

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("Connecting to VPS...")
    ssh.connect('159.198.36.24', 22, 'root', 'Xr2J2Wx9Unk0l7rI1C', timeout=30)
    print("Connected!")
    
    # 1. Update Nginx (Crucial for routing errors)
    # The config I want to push
    nginx_conf = """server {
    listen 80;
    server_name alphakolect.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name alphakolect.com;

    ssl_certificate /etc/letsencrypt/live/alphakolect.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/alphakolect.com/privkey.pem;

    # Smart Routing
    # Check if request is an API request (AJAX/Fetch) or a browser page request
    set $backend_port 5000;
    set $frontend_port 3000;

    # Routes to always send to backend
    location ~ ^/(api|uploads)/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        include proxy_params;
    }

    # Clashing routes: /merchant, /collaborator, /superadmin, /dashboard, /agents, /customers
    # If Accept header contains 'application/json', send to backend.
    # Otherwise send to frontend.
    location ~ ^/(merchant|collaborator|superadmin|dashboard|agents|customers|wallet|loan|accounting|investment|charges|staffManagement|branchManagement|settings)(/|$) {
        if ($http_accept ~* "application/json") {
            proxy_pass http://127.0.0.1:5000;
        }
        # Fallback to frontend
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        include proxy_params;
    }

    # Everything else to frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        include proxy_params;
    }
}"""
    
    # Write Nginx config
    with ssh.open_sftp() as sftp:
        with sftp.file('/etc/nginx/conf.d/alphaweb.conf', 'w') as f:
            f.write(nginx_conf)
    
    run_remote_command(ssh, "nginx -t && systemctl reload nginx")
    
    # 2. Pull latest code from GitHub
    run_remote_command(ssh, "cd /home/mayowae/public_html/alphaweb && git reset --hard && git pull origin main")
    
    # 3. Rebuild and Restart Services
    # For Backend:
    run_remote_command(ssh, "pm2 restart alphaweb-backend || (cd /home/mayowae/public_html/alphaweb/backend && pm2 start server.js --name alphaweb-backend)")
    
    # For Frontend:
    # First build locally or on VPS?
    # Usually build on VPS if resources permit.
    print("Rebuilding frontend...")
    run_remote_command(ssh, "cd /home/mayowae/public_html/alphaweb && npm run build")
    run_remote_command(ssh, "pm2 restart alphaweb-frontend || (cd /home/mayowae/public_html/alphaweb && pm2 start npm --name alphaweb-frontend -- start)")

    ssh.close()
    print("VPS Update Complete!")

except Exception as e:
    print(f"FAILED: {e}")
