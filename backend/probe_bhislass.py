import paramiko

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOSTNAME, port=22, username=USERNAME, password=PASSWORD)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

print("=== Listing /home/mayowae/bhislass.com ===")
out, err = run("ls -la /home/mayowae/bhislass.com")
print(out)

print("=== Searching for configurations (.env, wp-config.php, config.php, etc.) ===")
out, err = run("find /home/mayowae/bhislass.com -maxdepth 3 -name '.env' -o -name 'wp-config.php' -o -name 'config.php' -o -name 'config.js' -o -name 'database.php' 2>/dev/null")
print(out)

client.close()
