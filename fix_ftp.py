import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('ftp_config.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

# Find the actual config file
p("=== Find pure-ftpd config ===")
out = run("find /etc -name '*pure*' 2>/dev/null")
p(out)

out = run("ps aux | grep pure-ftpd | grep -v grep")
p("Process args:\n" + out)

# Read actual config
p("\n=== pure-ftpd.conf ===")
out = run("cat /etc/pure-ftpd.conf 2>/dev/null | grep -vE '^#|^$' | head -40")
p(out if out.strip() else "Not found at /etc/pure-ftpd.conf")

out = run("find /etc -name 'pure-ftpd.conf' 2>/dev/null | xargs cat 2>/dev/null | grep -vE '^#|^$' | head -50")
p("From find:\n" + out)

log.close()
print("Done - see ftp_config.txt")
client.close()
