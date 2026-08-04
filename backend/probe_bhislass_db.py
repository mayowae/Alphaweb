import paramiko

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'
BASE = '/home/mayowae/bhislass.com'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOSTNAME, port=22, username=USERNAME, password=PASSWORD)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

print("=== Checking if mysqldump is available ===")
out, err = run("which mysqldump")
print("mysqldump path:", out.strip())

print("=== Checking MySQL DB size (dump to /tmp) ===")
dump_cmd = "mysqldump -u mayowae_wp654 -ppt9195\(4\(S mayowae_wp654 > /tmp/bhislass_wp.sql"
out, err = run(dump_cmd)
if err.strip(): print("Dump ERR:", err)
out, err = run("ls -lh /tmp/bhislass_wp.sql")
print("SQL Dump info:", out.strip())
# Clean up temp dump
run("rm -f /tmp/bhislass_wp.sql")

print("\n=== Finding files larger than 50MB in bhislass.com ===")
out, err = run(f"find {BASE} -type f -size +50M -exec ls -lh {{}} \\;")
print(out)

client.close()
