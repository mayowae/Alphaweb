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

print("=== Checking pure-ftpd config for ChrootEveryone ===")
config_path = "/usr/local/apps/pureftpd/etc/pure-ftpd.conf"
print(run(f"grep -i 'ChrootEveryone' {config_path}"))

print("\n=== Checking alphawebftp user details ===")
# pure-pw show <user> -f <passwd_file>
print(run("pure-pw show alphawebftp -f /var/webuzo/pureftpd.passwd"))

print("\n=== Updating pure-ftpd.conf to disable ChrootEveryone ===")
run(f"sed -i 's/ChrootEveryone.*yes/ChrootEveryone              no/' {config_path}")
print(run(f"grep -i 'ChrootEveryone' {config_path}"))

print("\n=== Updating alphawebftp user to allow non-chroot access (-D) ===")
# We need to use -D instead of -d
# First delete and recreate or use 'usermod'
# Let's try usermod
run("pure-pw usermod alphawebftp -D /home/mayowae -f /var/webuzo/pureftpd.passwd")
run("pure-pw mkdb /var/webuzo/pureftpd.pdb -f /var/webuzo/pureftpd.passwd")
print(run("pure-pw show alphawebftp -f /var/webuzo/pureftpd.passwd"))

print("\n=== Restarting pure-ftpd ===")
print(run("service pure-ftpd restart"))

print("\n=== Verifying access to /etc from FTP ===")
ftp_user = 'alphawebftp'
ftp_pass = 'AlphaFTP@2026!'
# Test if we can list /etc
cmd = f"curl -v --connect-timeout 10 -u '{ftp_user}:{ftp_pass}' ftp://127.0.0.1/etc/ 2>&1 | grep -E '220|331|230|150|226|Error|denied|Login|Welcome'"
out = run(cmd)
print(out)

client.close()
