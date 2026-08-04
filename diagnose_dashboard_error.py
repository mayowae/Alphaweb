import paramiko
import json

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

app_dir = "/home/mayowae/public_html/alphaweb"
results = {}
results['app_dir'] = app_dir

print("Checking PM2 status...")
results['pm2_list'], _ = run("pm2 list")

# Check memory
results['free_m'], _ = run("free -m")

print("Checking listening ports...")
results['netstat'], _ = run("netstat -tulnp")

print("Checking Nginx config...")
results['nginx_sites'], _ = run("ls /etc/nginx/sites-enabled/ /etc/nginx/conf.d/ /usr/local/nginx/conf/ /etc/apache2/sites-enabled/ 2>/dev/null")
# Try to find alphaweb related nginx configs
results['nginx_find'], _ = run("find /etc/nginx -name '*alphaweb*' 2>/dev/null")

print("Reading Nginx alphaweb.conf...")
results['nginx_alphaweb_content'], _ = run("cat /etc/nginx/conf.d/alphaweb.conf")

print("Checking backend logs from file...")
results['backend_err_log'], _ = run("tail -n 100 ~/.pm2/logs/alphaweb-backend-error.log")
results['backend_out_log'], _ = run("tail -n 100 ~/.pm2/logs/alphaweb-backend-out.log")

print("Checking frontend logs from file...")
results['frontend_err_log'], _ = run("tail -n 100 ~/.pm2/logs/alphaweb-frontend-error.log")
results['frontend_out_log'], _ = run("tail -n 100 ~/.pm2/logs/alphaweb-frontend-out.log")

# Explore backend structure
results['backend_ls_root'], _ = run(f"ls -F {results['app_dir']}/backend/")
results['backend_ls_src'], _ = run(f"ls -F {results['app_dir']}/backend/src/ 2>/dev/null")

# Find where the routes are defined
results['backend_find_routes'], _ = run(f"find {results['app_dir']}/backend -name '*routes*' -type d 2>/dev/null")

# Check some actual route files
results['backend_route_files'], _ = run(f"find {results['app_dir']}/backend -name '*dashboard*routes*' 2>/dev/null")

# Check if dashboard data exists in the backend controllers
results['backend_controllers'], _ = run(f"find {results['app_dir']}/backend -name '*dashboard*controller*' 2>/dev/null")

# Read server.js
results['backend_server_content'], _ = run(f"cat {app_dir}/backend/server.js")

# List controllers
results['backend_controllers_ls'], _ = run(f"ls -F {app_dir}/backend/controllers/")

# List models
results['backend_models_ls'], _ = run(f"ls -F {app_dir}/backend/models/")

# Read dashboardController.js
results['dashboard_controller_content'], _ = run(f"cat {app_dir}/backend/controllers/dashboardController.js")

# Read auth middleware
results['auth_middleware_content'], _ = run(f"cat {app_dir}/backend/middleware/auth.js")

# Check for routes directory if it was missed
results['backend_routes_ls'], _ = run(f"ls -F {app_dir}/backend/routes/ 2>/dev/null")

# Test /dashboard/stats directly on port 5000 (bypass Nginx)
# Note: it might require a token, so we just check for 401/404
results['test_direct_stats'], _ = run("curl -i http://127.0.0.1:5000/dashboard/stats")

# Test /dashboard/stats through Nginx with JSON accept header
results['test_nginx_stats_json'], _ = run("curl -i -H 'Accept: application/json' https://alphakolect.com/dashboard/stats")

# Test /dashboard/stats through Nginx with HTML accept header (should go to frontend)
results['test_nginx_stats_html'], _ = run("curl -i -H 'Accept: text/html' https://alphakolect.com/dashboard/stats")

# Search for "dashboard" in server.js or any other file
results['backend_dashboard_search'], _ = run(f"grep -r 'dashboard' {app_dir}/backend/ --exclude-dir=node_modules --exclude-dir=old_project | head -n 20")

# Read backend .env
results['backend_env_content'], _ = run(f"cat {app_dir}/backend/.env")

# Read frontend .env
results['frontend_env_content'], _ = run(f"cat {app_dir}/.env")

with open('server_diag.json', 'w') as f:
    json.dump(results, f, indent=2)

client.close()
print("Diagnosis complete. Results saved to scratch/server_diag.json")
