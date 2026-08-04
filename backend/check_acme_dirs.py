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

def safe_print(*args):
    import sys
    text = " ".join(str(a) for a in args)
    encoded = text.encode(sys.stdout.encoding or 'utf-8', errors='replace')
    sys.stdout.buffer.write(encoded + b'\n')

def run_and_print(cmd):
    safe_print(f"--- Running: {cmd} ---")
    out, err = run(cmd)
    if out.strip():
        safe_print("STDOUT:")
        safe_print(out)
    if err.strip():
        safe_print("STDERR:")
        safe_print(err)

# 1. Check directory permissions and contents of /var/webuzo-data/www
run_and_print("ls -la /var/webuzo-data/www/")
run_and_print("ls -la /var/webuzo-data/www/.well-known/acme-challenge/ || echo 'none'")

# 2. Search for the acme.sh command or webroot in Webuzo logs
run_and_print("grep -rn 'acme.sh' /var/webuzo/logs/lets_encrypt.log | head -n 40 || echo 'not found'")
run_and_print("grep -rn 'webroot' /var/webuzo/logs/lets_encrypt.log | head -n 40 || echo 'not found'")

client.close()
