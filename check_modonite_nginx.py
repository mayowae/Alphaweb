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

print("--- Nginx Config Search ---")
# Find the config file
find_cmd = f"find /etc/nginx /usr/local/apps/nginx/etc /var/webuzo-data/nginx -name '*{domain}*' 2>/dev/null"
configs = run_ssh(find_cmd).strip().split('\n')
print(f"Found configs: {configs}")

for config in configs:
    if config:
        print(f"\n--- Content of {config} ---")
        print(run_ssh(f"cat {config}"))

print("\n--- Webuzo Domain Check ---")
print(run_ssh(f"grep -r '{domain}' /var/webuzo/users/mayowae/ 2>/dev/null"))

print("\n--- Check if Nginx is running correctly ---")
print(run_ssh("nginx -t"))
