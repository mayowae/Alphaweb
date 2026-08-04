import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

with open('ftp_probe_results_v5.txt', 'w', encoding='utf-8') as f:
    try:
        client.connect(hostname, port=port, username=username, password=password, timeout=30)
    except Exception as e:
        f.write(f"Failed to connect: {e}\n")
        exit(1)

    def run(cmd):
        stdin, stdout, stderr = client.exec_command(cmd)
        return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

    f.write("=== Listing /var/webuzo/users/mayowae/ ===\n")
    f.write(run("ls -la /var/webuzo/users/mayowae/") + "\n")

    f.write("\n=== Reading files in /var/webuzo/users/mayowae/ ===\n")
    f.write("--- ftp.conf ---\n")
    f.write(run("cat /var/webuzo/users/mayowae/ftp.conf 2>/dev/null") + "\n")
    f.write("--- user.conf ---\n")
    f.write(run("cat /var/webuzo/users/mayowae/user.conf 2>/dev/null") + "\n")
    f.write("--- domains ---\n")
    f.write(run("cat /var/webuzo/users/mayowae/domains 2>/dev/null") + "\n")

    f.write("\n=== Searching for alphawebftp password in all of /var/webuzo ===\n")
    f.write(run("grep -r 'alphawebftp' /var/webuzo 2>/dev/null | grep -v '.passwd' | head -n 20") + "\n")

    f.write("\n=== Checking for any other potential FTP users ===\n")
    f.write(run("pure-pw list") + "\n")

    client.close()
