import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'
domain = 'modoniteintegrated.com.ng'

def run_ssh(cmd):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(hostname, port=port, username=username, password=password, timeout=30)
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='replace')
        err = stderr.read().decode('utf-8', errors='replace')
        client.close()
        return out + err
    except Exception as e:
        return f"SSH Error: {e}"

print(f"=== Deep Diagnosis for {domain} ===")

# 1. Check all Nginx sites
print("\n--- Nginx Sites ---")
print(run_ssh("ls -l /etc/nginx/sites-enabled/ /usr/local/apps/nginx/etc/conf.d/ 2>/dev/null"))

# 2. Search for the domain in all config files
print("\n--- Domain Grep ---")
print(run_ssh(f"grep -r '{domain}' /etc/nginx /usr/local/apps/nginx/etc /usr/local/webuzo/users/ 2>/dev/null | grep -v 'Binary file' | head -n 20"))

# 3. Check Webuzo Domain List
print("\n--- Webuzo Domain List ---")
print(run_ssh("cat /var/webuzo/users/mayowae/domains 2>/dev/null"))

# 4. Check if the domain is pointed to the correct folder
print("\n--- Webuzo Config for Domain ---")
# Webuzo stores domain info in /var/webuzo/users/mayowae/info
print(run_ssh("grep -A 10 'modoniteintegrated.com.ng' /var/webuzo/users/mayowae/info 2>/dev/null"))

# 5. Check actual web root contents
print("\n--- Web Root Contents ---")
# Try the most likely path
print(run_ssh(f"ls -la /home/mayowae/public_html/{domain} 2>/dev/null || ls -la /home/mayowae/{domain} 2>/dev/null"))

# 6. Check Nginx Error Log
print("\n--- Nginx Error Log (Recent) ---")
print(run_ssh("tail -n 20 /var/log/nginx/error.log /usr/local/apps/nginx/var/log/error.log 2>/dev/null"))
