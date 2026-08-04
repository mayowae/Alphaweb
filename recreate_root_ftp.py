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

ftp_user = 'alphawebftp'
ftp_pass = 'AlphaFTP@2026!'
passwd_file = '/var/webuzo/pureftpd.passwd'
pdb_file = '/var/webuzo/pureftpd.pdb'

print("=== Recreating FTP user with root mapping ===")
run(f"pure-pw userdel {ftp_user} -f {passwd_file}")
# Create with -D / and map to uid 0 gid 0
cmd = f"echo -e '{ftp_pass}\n{ftp_pass}' | pure-pw useradd {ftp_user} -u 0 -g 0 -D / -f {passwd_file}"
run(cmd)
run(f"pure-pw mkdb {pdb_file} -f {passwd_file}")

print("\n=== Verifying password file entry ===")
print(run(f"grep '{ftp_user}' {passwd_file}"))

print("\n=== Restarting pure-ftpd ===")
print(run("service pure-ftpd restart"))

client.close()
