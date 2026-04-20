import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('ftp_webuzo.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

ftp_user = 'alphawebftp'
ftp_pass = 'AlphaFTP@2026!'

# Read the actual pure-ftpd.conf (Webuzo version)
p("=== Pure-FTPd config (Webuzo) ===")
out = run("grep -vE '^#|^$' /usr/local/apps/pureftpd/etc/pure-ftpd.conf | head -30")
p(out)

# Check if puredb file exists and what users are in it
p("\n=== Webuzo puredb users ===")
out = run("pure-pw list -f /var/webuzo/pureftpd.pdb 2>/dev/null || pure-pw list 2>/dev/null | head -20")
p(out if out.strip() else "Could not list")

# Check the passwd file
p("\n=== pureftpd.passwd ===")
out = run("cat /etc/pureftpd.passwd 2>/dev/null | head -5 || cat /var/webuzo/pureftpd.passwd 2>/dev/null | head -5")
p(out if out.strip() else "Not found")

# Create virtual FTP user via pure-pw pointing to root home with system user 'root'
# This gives access to all dirs
p("\n=== Creating virtual FTP user (puredb) ===")
cmd = f"echo -e '{ftp_pass}\n{ftp_pass}' | pure-pw useradd {ftp_user} -u root -d / -f /etc/pureftpd.passwd 2>&1"
out = run(cmd)
p("pure-pw useradd: " + (out if out.strip() else "OK"))

# Update the puredb
out = run("pure-pw mkdb /etc/pureftpd.pdb -f /etc/pureftpd.passwd 2>&1")
p("mkdb: " + (out if out.strip() else "OK"))

# Also try with Webuzo path
p("\n=== Also try Webuzo pureftpd.pdb path ===")
cmd2 = f"echo -e '{ftp_pass}\n{ftp_pass}' | pure-pw useradd {ftp_user} -u root -d / -f /var/webuzo/pureftpd.passwd 2>&1"
out = run(cmd2)
p("Webuzo useradd: " + (out if out.strip() else "OK"))
out = run("pure-pw mkdb /var/webuzo/pureftpd.pdb -f /var/webuzo/pureftpd.passwd 2>&1")
p("Webuzo mkdb: " + (out if out.strip() else "OK"))

# Reload pure-ftpd
out = run("service pure-ftpd restart 2>&1")
p("FTP restart: " + out.replace('\n', ' '))
time.sleep(3)

# Test the login
p("\n=== Test FTP login ===")
out = run(f"curl -v --connect-timeout 8 -u '{ftp_user}:{ftp_pass}' ftp://127.0.0.1/ 2>&1 | tail -20")
p(out)

log.close()
print("Done - see ftp_webuzo.txt")
client.close()
