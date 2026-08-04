import paramiko

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'
WP_CONFIG = '/home/mayowae/bhislass.com/wp-config.php'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOSTNAME, port=22, username=USERNAME, password=PASSWORD)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

print("=== Reading wp-config.php database lines ===")
out, err = run(f"grep -E 'DB_NAME|DB_USER|DB_PASSWORD|DB_HOST' {WP_CONFIG}")
print(out)

client.close()
