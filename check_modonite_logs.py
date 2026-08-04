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

print("--- Nginx Error Logs for Domain ---")
print(run_ssh("tail -n 50 /usr/local/apps/nginx/var/log/modoniteintegrated.com.ng.err 2>/dev/null"))

print("\n--- Apache Error Logs for Domain ---")
print(run_ssh("tail -n 50 /usr/local/apps/apache/var/log/modoniteintegrated.com.ng.err 2>/dev/null"))
