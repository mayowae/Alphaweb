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

print("=== Checking /home/mayowae contents ===")
out, err = run("ls -la /home/mayowae")
print(out)

print("=== Checking /var/mail and /var/spool/mail ===")
out, err = run("ls -la /var/mail /var/spool/mail 2>/dev/null")
print(out)

print("=== Checking if pg_dump is available ===")
out, err = run("which pg_dump")
print("pg_dump path:", out.strip())

print("=== Checking disk space ===")
out, err = run("df -h")
print(out)

client.close()
