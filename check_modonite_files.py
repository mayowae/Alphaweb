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

print("--- Listing all directories in /home/mayowae/ ---")
print(run_ssh("ls -F /home/mayowae/"))

print("\n--- Check if modoniteintegrated.com.ng is a symlink ---")
print(run_ssh("ls -ld /home/mayowae/modoniteintegrated.com.ng"))

print("\n--- Searching for any index.php or index.html files related to modonite ---")
print(run_ssh("find /home/mayowae -name 'index.*' | grep 'modonite'"))

print("\n--- Check Nginx access log for this domain ---")
print(run_ssh("tail -n 20 /usr/local/apps/nginx/var/log/modoniteintegrated.com.ng.log 2>/dev/null"))
