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

print("=== User Details (Full) ===")
print(run("pure-pw show alphawebftp -f /var/webuzo/pureftpd.passwd"))

print("\n=== Config Details (TrustedGID) ===")
config_path = "/usr/local/apps/pureftpd/etc/pure-ftpd.conf"
print(run(f"grep -iE 'TrustedGID|ChrootEveryone' {config_path}"))

print("\n=== Commenting out TrustedGID and ensuring ChrootEveryone is no ===")
run(f"sed -i 's/^TrustedGID/# TrustedGID/' {config_path}")
run(f"sed -i 's/^ChrootEveryone.*yes/ChrootEveryone              no/' {config_path}")
# Also check if there is an un-commented ChrootEveryone
run(f"sed -i 's/^ChrootEveryone.*yes/ChrootEveryone              no/' {config_path}")

print("\n=== Restarting pure-ftpd again ===")
print(run("service pure-ftpd restart"))

client.close()
