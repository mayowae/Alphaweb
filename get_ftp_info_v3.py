import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(hostname, port=port, username=username, password=password, timeout=30)
except Exception as e:
    print(f"Failed to connect: {e}")
    exit(1)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

print("=== Checking Webuzo FTP accounts in its database ===")
# Webuzo uses an SQLite database for its settings
print(run("find /var/webuzo -name '*.db'"))
print(run("ls -l /usr/local/webuzo/"))

print("\n=== Checking for password files in webuzo ===")
print(run("grep -r 'alphawebftp' /var/webuzo/ 2>/dev/null"))
print(run("grep -r 'alphawebftp' /usr/local/webuzo/ 2>/dev/null"))

print("\n=== Checking for pure-ftpd pdb file ===")
print(run("ls -l /etc/pure-ftpd/pureftpd.pdb"))

print("\n=== Checking for any .ftp_password or similar files ===")
print(run("find /home/mayowae -name '*ftp*' 2>/dev/null"))

client.close()
