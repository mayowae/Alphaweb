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

print("=== Creating user with mayowae UID first ===")
run(f"pure-pw userdel {ftp_user} -f {passwd_file}")
cmd = f"echo -e '{ftp_pass}\n{ftp_pass}' | pure-pw useradd {ftp_user} -u 1003 -g 1004 -D /home/mayowae -f {passwd_file}"
run(cmd)

print("\n=== Hacking the passwd file to map to root and use / home ===")
# Format: user:pass:uid:gid:gecos:home:rest
# current: alphawebftp:$hash:1003:1004::/home/mayowae::::::::::::
# want: alphawebftp:$hash:0:0::/::::::::::::
run(f"sed -i 's/^alphawebftp:\\([^:]*\\):1003:1004::\\/home\\/mayowae/alphawebftp:\\1:0:0::\\//' {passwd_file}")

print("\n=== Rebuilding PDB ===")
print(run(f"pure-pw mkdb {pdb_file} -f {passwd_file}"))

print("\n=== Verifying entry in pdb ===")
print(run(f"pure-pw show {ftp_user} -f {passwd_file}"))

print("\n=== Restarting pure-ftpd ===")
print(run("service pure-ftpd restart"))

print("\n=== Testing access to /root/ via FTP ===")
cmd = f"curl -v --connect-timeout 10 -u '{ftp_user}:{ftp_pass}' ftp://127.0.0.1//root/ 2>&1 | grep -E '220|331|230|150|226|Error|denied|Login|Welcome|anaconda|config|local'"
out = run(cmd)
print(out)

client.close()
