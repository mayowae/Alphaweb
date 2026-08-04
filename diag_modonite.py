import paramiko
import socket

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

print(f"=== Diagnosing {domain} ===")

# 1. DNS Check
print("\n--- DNS Check ---")
try:
    ip = socket.gethostbyname(domain)
    print(f"Domain {domain} resolves to {ip}")
    if ip == hostname:
        print("DNS is correctly pointing to this server.")
    else:
        print(f"DNS is NOT pointing to this server (Expected {hostname})")
except Exception as e:
    print(f"DNS resolution failed: {e}")

# 2. Check Nginx Config
print("\n--- Nginx Config Check ---")
cmd_nginx = f"grep -r '{domain}' /etc/nginx/ /usr/local/apps/nginx/etc/ /usr/local/webuzo/ 2>/dev/null"
print(run_ssh(cmd_nginx))

# 3. Check for the domain's root directory
print("\n--- Directory Check ---")
# Usually /home/mayowae/modoniteintegrated.com.ng or similar
cmd_dir = f"find /home -name '{domain}' -type d 2>/dev/null"
dir_out = run_ssh(cmd_dir).strip()
print(f"Found directory: {dir_out}")
if dir_out:
    print(run_ssh(f"ls -la {dir_out} | head -n 10"))

# 4. Check Webuzo status
print("\n--- Webuzo Service Check ---")
print(run_ssh("ps aux | grep webuzo | grep -v grep"))

# 5. Check if the site is active in Nginx
print("\n--- Nginx Active Sites ---")
print(run_ssh("ls -l /etc/nginx/sites-enabled/ 2>/dev/null"))
