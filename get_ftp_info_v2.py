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

print("=== FTP Service Status ===")
print(run("netstat -tunlp | grep ':21'"))
print(run("systemctl list-units --type=service | grep -iE 'ftp|vsftpd|proftpd|pure-ftpd'"))

print("\n=== FTP Configuration Files ===")
print(run("ls -l /etc/vsftpd.conf /etc/vsftpd/vsftpd.conf /etc/proftpd/proftpd.conf /etc/pure-ftpd/pure-ftpd.conf /etc/pure-ftpd.conf 2>/dev/null"))

print("\n=== Checking for Pure-FTPD Users (if any) ===")
print(run("pure-pw list 2>/dev/null"))

print("\n=== Checking for Webuzo FTP Users (if any) ===")
# Webuzo often stores FTP info in its own db or files
print(run("ls -l /usr/local/webuzo/config/ 2>/dev/null"))

print("\n=== Checking /etc/passwd for potential FTP users ===")
print(run("grep -E '/home/|/var/www/' /etc/passwd"))

print("\n=== Checking Nginx Configs for paths ===")
print(run("grep -r 'root' /etc/nginx/sites-enabled/ 2>/dev/null | head -n 20"))

client.close()
