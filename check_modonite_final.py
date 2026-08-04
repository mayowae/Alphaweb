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

print(f"--- DNS Resolution for {domain} ---")
try:
    ip = socket.gethostbyname(domain)
    print(f"External Resolution: {domain} -> {ip}")
except:
    print(f"External Resolution failed for {domain}")

print("\n--- Internal DNS Resolution ---")
print(run_ssh(f"host {domain} || ping -c 1 {domain}"))

print("\n--- Searching for the domain in all of /etc/nginx and /usr/local/apps/nginx ---")
print(run_ssh(f"grep -r '{domain}' /etc/nginx /usr/local/apps/nginx/etc /var/webuzo-data/nginx 2>/dev/null | grep -v '.bak' | grep -v '.tmp'"))

print("\n--- Check if PHP-FPM is running for user mayowae ---")
print(run_ssh("ps aux | grep php-fpm | grep mayowae"))

print("\n--- Check Webuzo services ---")
print(run_ssh("service nginx status"))
print(run_ssh("service php-fpm status"))
