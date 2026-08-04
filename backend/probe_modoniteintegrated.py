import paramiko

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'
BASE = '/home/mayowae/modoniteintegrated.com.ng'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOSTNAME, port=22, username=USERNAME, password=PASSWORD)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

print("=== Listing /home/mayowae/modoniteintegrated.com.ng ===")
out, err = run(f"ls -la {BASE}")
print(out)

print("=== Searching for configurations (.env, wp-config.php, config.php, etc.) ===")
out, err = run(f"find {BASE} -maxdepth 3 -name '.env' -o -name 'wp-config.php' -o -name 'config.php' -o -name 'config.js' -o -name 'database.php' 2>/dev/null")
print(out)

print("=== Checking mail size for modoniteintegrated.com.ng ===")
out, err = run("du -sh /home/mayowae/mail/modoniteintegrated.com.ng")
print(out)

client.close()
