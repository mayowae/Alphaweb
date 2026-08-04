import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

with open('ftp_probe_results.txt', 'w', encoding='utf-8') as f:
    try:
        client.connect(hostname, port=port, username=username, password=password, timeout=30)
    except Exception as e:
        f.write(f"Failed to connect: {e}\n")
        exit(1)

    def run(cmd):
        stdin, stdout, stderr = client.exec_command(cmd)
        return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

    f.write("=== Checking Webuzo FTP accounts in its database ===\n")
    f.write(run("find /var/webuzo -name '*.db'") + "\n")
    f.write(run("ls -l /usr/local/webuzo/") + "\n")

    f.write("\n=== Checking for password files in webuzo ===\n")
    f.write(run("grep -r 'alphawebftp' /var/webuzo/ 2>/dev/null") + "\n")
    f.write(run("grep -r 'alphawebftp' /usr/local/webuzo/ 2>/dev/null") + "\n")

    f.write("\n=== Checking for pure-ftpd pdb file ===\n")
    f.write(run("ls -l /etc/pure-ftpd/pureftpd.pdb") + "\n")

    f.write("\n=== Checking for any .ftp_password or similar files ===\n")
    # Limiting the find command to avoid too much output
    f.write(run("find /home/mayowae -maxdepth 2 -name '*ftp*'") + "\n")
    
    # Check if we can find the webuzo password for the user
    f.write("\n=== Webuzo User Config ===\n")
    f.write(run("cat /var/webuzo/users/mayowae/ftp.conf 2>/dev/null") + "\n")

    client.close()
