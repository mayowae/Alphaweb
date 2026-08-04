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

print("=== Compressing mail directory to check size ===")
# Tar it into /tmp/
run("rm -f /tmp/bhislass_mail.tar.gz")
out, err = run("tar -czf /tmp/bhislass_mail.tar.gz -C /home/mayowae/mail bhislass.com")
if err.strip(): print("Tar ERR:", err)

out, err = run("ls -lh /tmp/bhislass_mail.tar.gz")
print("Compressed Mail Size info:", out.strip())

# Clean up temp file
run("rm -f /tmp/bhislass_mail.tar.gz")

client.close()
