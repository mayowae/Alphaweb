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

print("--- Service Check ---")
print(run_ssh("service httpd status || service apache2 status"))
print(run_ssh("netstat -tunlp | grep -E ':80|:443|:8081'"))

print("\n--- Apache Config Check ---")
print(run_ssh("grep -r 'modoniteintegrated.com.ng' /etc/httpd /usr/local/apps/apache 2>/dev/null"))

print("\n--- Nginx Config File (/etc/nginx/conf.d/modoniteintegrated.com.ng.conf) ---")
print(run_ssh("cat /etc/nginx/conf.d/modoniteintegrated.com.ng.conf"))
