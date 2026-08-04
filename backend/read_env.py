import paramiko

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'
BASE = '/home/mayowae/public_html/alphaweb'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOSTNAME, port=22, username=USERNAME, password=PASSWORD)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

print("=== Reading live .env file ===")
out, err = run(f"cat {BASE}/backend/.env")
for line in out.splitlines():
    if not line.strip() or line.startswith("#"):
        continue
    if any(line.startswith(prefix) for prefix in ["DATABASE_URL", "DB_", "SMTP_", "EMAIL_", "PORT"]):
        print(line)

client.close()
