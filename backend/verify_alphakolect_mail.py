import paramiko

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'
MAIL_DIR = '/home/mayowae/mail/alphakolect.com'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOSTNAME, port=22, username=USERNAME, password=PASSWORD)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

print("=== Checking subdirectories in alphakolect.com mail folder ===")
out, err = run(f"ls -la {MAIL_DIR}")
print(out)

print("=== Scanning for mail files (new/cur/tmp folders) ===")
# Find all files in new, cur, tmp directories to verify individual email files exist
out, err = run(f"find {MAIL_DIR} -type d -name 'cur' -o -name 'new' | head -20")
print("Mail boxes folders found:")
print(out)

out, err = run(f"find {MAIL_DIR} -type f | wc -l")
print("Total files inside mail directory:", out.strip())

out, err = run(f"find {MAIL_DIR} -type f | head -30")
print("Sample files inside mail directory:")
print(out)

client.close()
