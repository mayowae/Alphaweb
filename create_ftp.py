import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('ftp_create.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

# FTP credentials
ftp_user = 'alphawebftp'
ftp_pass = 'AlphaFTP@2026!'

p("=== Creating FTP system user ===")

# 1. Create system user with home = / (full server access)
out = run(f"useradd -m -d / -s /bin/bash {ftp_user} 2>&1")
p("useradd: " + (out if out.strip() else "OK"))

# 2. Set password
out = run(f"echo '{ftp_user}:{ftp_pass}' | chpasswd 2>&1")
p("password set: " + (out if out.strip() else "OK"))

# 3. Pure-FTPd uses /etc/pure-ftpd/conf/NoAnonymous and chrooteveryone
# Check current pure-ftpd config
p("\n=== Pure-FTPd config ===")
out = run("ls /etc/pure-ftpd/conf/ 2>/dev/null || ls /etc/pure-ftpd/ 2>/dev/null")
p(out)
out = run("cat /etc/pure-ftpd/conf/ChrootEveryone 2>/dev/null || echo 'not found'")
p("ChrootEveryone: " + out)

# 4. Disable chroot for this user so they can access all directories
# Pure-FTPd: to allow full access, we need ChrootEveryone=no
# OR use TrustedUserGID / TrustedUID
out = run("echo 'no' > /etc/pure-ftpd/conf/ChrootEveryone 2>&1; echo done")
p("Set ChrootEveryone=no: " + out)

# 5. Also ensure the user is NOT blocked
out = run("cat /etc/pure-ftpd/conf/NoAnonymous 2>/dev/null || echo 'not found'")
p("NoAnonymous: " + out)

# Make sure anonymous is blocked but real users allowed
out = run("echo 'yes' > /etc/pure-ftpd/conf/NoAnonymous 2>&1; echo done")
p("Set NoAnonymous=yes: " + out)

# 6. Allow logins from /etc/passwd users
out = run("cat /etc/pure-ftpd/conf/UnixAuthentication 2>/dev/null || echo 'not found'")
p("UnixAuthentication: " + out)
out = run("echo 'yes' > /etc/pure-ftpd/conf/UnixAuthentication 2>&1; echo done")
p("Set UnixAuthentication=yes: " + out)

# 7. Disable TLS requirement if it's blocking plain connections
out = run("cat /etc/pure-ftpd/conf/TLS 2>/dev/null")
p("TLS setting: " + (out if out.strip() else "not set"))
# Set TLS=0 (allow plain FTP too, not mandatory)
out = run("echo '0' > /etc/pure-ftpd/conf/TLS 2>&1; echo done")
p("Set TLS=0: " + out)

# 8. Restart pure-ftpd
p("\n=== Restarting pure-ftpd ===")
out = run("service pure-ftpd restart 2>&1")
p(out)
time.sleep(3)

# 9. Verify service is up
out = run("service pure-ftpd status 2>&1 | head -5")
p("Status:\n" + out)

# 10. Test the user exists
out = run(f"id {ftp_user}")
p(f"\nUser '{ftp_user}': " + out)

# 11. Confirm port 21 listening
out = run("netstat -tunlp | grep ':21 '")
p("Port 21: " + out)

# Print final credentials
p("\n" + "="*50)
p("FTP ACCOUNT DETAILS")
p("="*50)
p(f"Host:     {hostname}  (or alphakolect.com)")
p(f"Port:     21")
p(f"Username: {ftp_user}")
p(f"Password: {ftp_pass}")
p("Root dir: /  (full server access)")
p("Protocol: FTP (use Explicit FTPS/TLS if client supports it)")
p("="*50)

log.close()
print("Done - see ftp_create.txt")
client.close()
