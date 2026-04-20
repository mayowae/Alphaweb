import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('ftp_final.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

# Read the init script to find how pure-ftpd is launched (its flags)
p("=== pure-ftpd init script (launch args) ===")
out = run("cat /etc/rc.d/init.d/pure-ftpd | grep -E 'OPTS|pure-ftpd|daemon' | head -20")
p(out)

# Check the Webuzo/Softaculous panel config if present
p("\n=== Webuzo pure-ftpd config ===")
out = run("find /usr/local/webuzo /var/webuzo -name '*ftpd*' 2>/dev/null | head -5")
p(out)

# Try pure-ftpd virtual users approach using puredb
p("\n=== Check puredb/virtual users ===")
out = run("ls /etc/pureftpd.passwd /etc/pureftpd.pdb 2>/dev/null; which pure-pw 2>/dev/null")
p(out)

# Check if Webuzo has its own FTP control
p("\n=== Test FTP login with created user ===")
out = run("curl -s --connect-timeout 5 ftp://alphawebftp:AlphaFTP@2026!@127.0.0.1/ 2>&1 | head -10")
p(out)

# Direct test with lftp if available
out = run("which lftp 2>/dev/null && echo 'has lftp' || echo 'no lftp'")
p("lftp: " + out)

# Check syslog for FTP connection attempts
p("\n=== FTP log entries ===")
out = run("grep -i 'pure-ftpd\\|ftp' /var/log/messages 2>/dev/null | tail -10")
p(out if out.strip() else "No entries in /var/log/messages")
out = run("journalctl -u pure-ftpd --no-pager -n 10 2>/dev/null")
p("journalctl: " + (out if out.strip() else "no entries"))

log.close()
print("Done - see ftp_final.txt")
client.close()
