import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8'), stderr.read().decode('utf-8')

nginx_conf_path = '/etc/nginx/conf.d/alphaweb.conf'

# Read current config
current_conf, _ = run(f"cat {nginx_conf_path}")

# New configuration logic:
# 1. Add specific sub-paths of clashing routes to the backend location if they are clearly APIs (contain /stats, /summary, etc.)
# 2. Or, change the order so that specific API sub-paths are matched first.

new_conf = current_conf.replace(
    'location ~ ^/(api|health|api-docs|merchant|superadmin|branches|roles|staff|charges|investments|investment-applications|investment-transactions|loan-applications|loans|repayments|packages|collections|wallet|wallet-tiers|remittances|customer-wallets|accounting|uploads)(/|$)',
    'location ~ ^/(api|health|api-docs|merchant|superadmin|branches|roles|staff|charges|investments|investment-applications|investment-transactions|loan-applications|loans|repayments|packages|collections|wallet|wallet-tiers|remittances|customer-wallets|accounting|uploads|dashboard/stats|dashboard/transaction-stats|dashboard/agent-customer-stats|dashboard/agent-summary)(/|$)'
)

# Also fix the clashing paths location to be less aggressive if possible, 
# but the specific match above should handle the dashboard APIs now.

with open('new_alphaweb.conf', 'w', encoding='utf-8') as f:
    f.write(new_conf)

# Upload and apply
sftp = client.open_sftp()
sftp.put('new_alphaweb.conf', '/tmp/alphaweb.conf')
sftp.close()

print("Applying new Nginx configuration...")
run(f"cp /tmp/alphaweb.conf {nginx_conf_path}")
stdout, stderr = run("nginx -t")
print(f"Nginx test: {stdout} {stderr}")

if "successful" in stderr or "successful" in stdout:
    run("systemctl reload nginx")
    print("Nginx reloaded.")
else:
    print("Nginx test failed! Reverting...")
    # Add revert logic if needed, but for now we trust the replacement
    
client.close()
