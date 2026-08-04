import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

with open('ftp_probe_results_v6.txt', 'w', encoding='utf-8') as f:
    try:
        client.connect(hostname, port=port, username=username, password=password, timeout=30)
    except Exception as e:
        f.write(f"Failed to connect: {e}\n")
        exit(1)

    def run(cmd):
        stdin, stdout, stderr = client.exec_command(cmd)
        return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

    f.write("=== Reading /var/webuzo/users/mayowae/ftp ===\n")
    f.write(run("cat /var/webuzo/users/mayowae/ftp") + "\n")

    f.write("\n=== Reading /var/webuzo/users/mayowae/info ===\n")
    f.write(run("cat /var/webuzo/users/mayowae/info") + "\n")

    f.write("\n=== Checking for any .webuzo_password or similar ===\n")
    f.write(run("ls -la /home/mayowae/.webuzo* 2>/dev/null") + "\n")

    client.close()
