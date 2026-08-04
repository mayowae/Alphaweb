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

print("--- Active Nginx Config Check ---")
print(run_ssh("grep -r 'modoniteintegrated.com.ng' /usr/local/apps/nginx/etc/conf.d/webuzoVH.conf"))

print("\n--- Listing Files in /home/mayowae/ ---")
print(run_ssh("ls -la /home/mayowae/ | grep 'modonite'"))

print("\n--- Check Webuzo info for real path ---")
# Let's read the whole info file for the user mayowae
print(run_ssh("cat /var/webuzo/users/mayowae/info"))
