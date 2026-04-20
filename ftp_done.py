import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('ftp_done.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

ftp_user = 'alphawebftp'
ftp_pass = 'AlphaFTP@2026!'
# Home = / but pure-ftpd needs it to physically exist.
# Use /home/mayowae (which has all the web files) as home BUT 
# disable chroot so user can navigate up to / 
# We do this by editing the config to set ChrootEveryone no

p("=== Step 1: Create user with /home/mayowae as base dir ===")
# Delete old failed attempt
run(f"pure-pw userdel {ftp_user} -f /var/webuzo/pureftpd.passwd 2>/dev/null")

# Create user with home = /home/mayowae (Webuzo web root)
# -u maps to system user 'mayowae' (uid >= 500, satisfies MinUID)
cmd = f"echo -e '{ftp_pass}\n{ftp_pass}' | pure-pw useradd {ftp_user} -u mayowae -g mayowae -d /home/mayowae -f /var/webuzo/pureftpd.passwd 2>&1"
out = run(cmd)
p("useradd: " + (out.strip() if out.strip() else "OK"))

# Rebuild the pdb
out = run("pure-pw mkdb /var/webuzo/pureftpd.pdb -f /var/webuzo/pureftpd.passwd 2>&1")
p("mkdb: " + (out.strip() if out.strip() else "OK"))

# Step 2: Disable ChrootEveryone so user can browse up from /home/mayowae
p("\n=== Step 2: Disable ChrootEveryone in config ===")
out = run("sed -i 's/ChrootEveryone.*yes/ChrootEveryone              no/' /usr/local/apps/pureftpd/etc/pure-ftpd.conf")
p("ChrootEveryone disabled: " + (out.strip() if out.strip() else "OK"))

# Verify
out = run("grep ChrootEveryone /usr/local/apps/pureftpd/etc/pure-ftpd.conf")
p("Config now: " + out.strip())

# Step 3: Restart FTP
out = run("service pure-ftpd restart 2>&1")
p("Restart: " + out.replace('\n', ' '))
time.sleep(3)

# Step 4: Test login
p("\n=== Step 4: Test login ===")
out = run(f"curl -v --connect-timeout 8 -u '{ftp_user}:{ftp_pass}' ftp://127.0.0.1/ 2>&1 | grep -E '220|331|230|530|227|150|Error|denied|Login|Welcome'")
p(out)

log.close()
print("Done - see ftp_done.txt")
client.close()
