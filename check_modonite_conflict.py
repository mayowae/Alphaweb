import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

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

print("--- Nginx Instance Check ---")
print(run_ssh("ls -l /proc/1045548/exe"))

print("\n--- Check for conflicting Nginx configs ---")
print(run_ssh("ls -l /etc/nginx/conf.d/modoniteintegrated.com.ng.conf"))
print(run_ssh("grep -r 'modoniteintegrated.com.ng' /usr/local/apps/nginx/etc/conf.d/webuzoVH.conf"))

print("\n--- Check Apache VirtualHosts ---")
print(run_ssh("grep -r 'modoniteintegrated.com.ng' /etc/httpd /usr/local/apps/apache/etc 2>/dev/null"))

print("\n--- Summary of DNS for User ---")
print("I've noticed the domain modoniteintegrated.com.ng does not resolve externally.")
