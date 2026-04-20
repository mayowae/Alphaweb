import paramiko
import time
import random, string

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('ftp_setup.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

# Check what FTP server is installed
p("=== FTP server check ===")
out = run("which vsftpd proftpd pure-ftpd 2>/dev/null; systemctl list-units --type=service | grep -iE 'ftp'")
p(out)

out = run("systemctl is-active vsftpd 2>/dev/null; systemctl is-active proftpd 2>/dev/null; systemctl is-active pure-ftpd 2>/dev/null")
p("Service status:\n" + out)

out = run("netstat -tunlp | grep ':21'")
p("Port 21:\n" + out)

log.close()
print("Done - see ftp_setup.txt")
client.close()
