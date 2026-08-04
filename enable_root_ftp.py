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

config_path = "/usr/local/apps/pureftpd/etc/pure-ftpd.conf"

print("=== Setting MinUID to 0 and ensuring ChrootEveryone is no ===")
run(f"sed -i 's/^MinUID.*/MinUID                      0/' {config_path}")
run(f"sed -i 's/^ChrootEveryone.*yes/ChrootEveryone              no/' {config_path}")
print(run(f"grep -iE 'MinUID|ChrootEveryone' {config_path}"))

print("\n=== Updating alphawebftp user to map to root (UID 0) ===")
# Map to system user root (uid 0, gid 0)
# We use -D / to set the starting directory to root
run("pure-pw usermod alphawebftp -u 0 -g 0 -D / -f /var/webuzo/pureftpd.passwd")
run("pure-pw mkdb /var/webuzo/pureftpd.pdb -f /var/webuzo/pureftpd.passwd")
print(run("pure-pw show alphawebftp -f /var/webuzo/pureftpd.passwd"))

print("\n=== Restarting pure-ftpd ===")
print(run("service pure-ftpd restart"))

print("\n=== Verifying root access from FTP ===")
ftp_user = 'alphawebftp'
ftp_pass = 'AlphaFTP@2026!'
# Test listing /root/
cmd = f"curl -v --connect-timeout 10 -u '{ftp_user}:{ftp_pass}' ftp://127.0.0.1//root/ 2>&1 | grep -E '220|331|230|150|226|Error|denied|Login|Welcome|anaconda|config|local'"
out = run(cmd)
print(out)

client.close()
