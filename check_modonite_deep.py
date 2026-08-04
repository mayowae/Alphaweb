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

print("--- Detailed Directory Content of /home/mayowae/modoniteintegrated.com.ng ---")
print(run_ssh("ls -laR /home/mayowae/modoniteintegrated.com.ng"))

print("\n--- Check if the site is in public_html ---")
print(run_ssh("ls -la /home/mayowae/public_html/modoniteintegrated.com.ng 2>/dev/null"))

print("\n--- Check Nginx Site Config (Active One) ---")
# Let's find the active config in /usr/local/apps/nginx/etc/conf.d/
print(run_ssh("grep -l 'modoniteintegrated.com.ng' /usr/local/apps/nginx/etc/conf.d/*.conf"))
print(run_ssh("cat /usr/local/apps/nginx/etc/conf.d/webuzoVH.conf | grep -A 20 'modoniteintegrated.com.ng'"))

print("\n--- Check if the domain resolves to this server (External) ---")
import socket
try:
    ip = socket.gethostbyname(domain)
    print(f"{domain} resolves to {ip}")
except:
    print(f"{domain} resolution failed")
