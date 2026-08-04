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

print("--- Nginx Config Content ---")
print(run_ssh("cat /var/webuzo-data/nginx/domains/modoniteintegrated.com.ng.conf"))

print("\n--- Nginx Custom Config Content ---")
print(run_ssh("cat /var/webuzo-data/nginx/custom/domains/modoniteintegrated.com.ng.conf"))

print("\n--- Check Webuzo info file for root path ---")
print(run_ssh(f"grep -A 5 '{domain}' /var/webuzo/users/mayowae/info"))

print("\n--- Check if the domain is enabled in Nginx main config ---")
print(run_ssh("grep -r 'modoniteintegrated.com.ng' /etc/nginx/conf.d/ /etc/nginx/sites-enabled/ /usr/local/apps/nginx/etc/conf.d/ 2>/dev/null"))
