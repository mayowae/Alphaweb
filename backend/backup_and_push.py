import paramiko
import time

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'
BASE = '/home/mayowae/public_html/alphaweb'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOSTNAME, port=22, username=USERNAME, password=PASSWORD)

def run(cmd, timeout=120):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

print("Step 1: Create backups directory...")
out, err = run(f"mkdir -p {BASE}/backups")
print("OUT:", out)
if err.strip(): print("ERR:", err)

print("\nStep 2: Dump database (alphacollect_db) with gzip...")
db_dump_cmd = f"PGPASSWORD='AlphaW3b@Local2024' pg_dump -h 127.0.0.1 -U alpha_admin -d alphacollect_db | gzip > {BASE}/backups/alphacollect_db.sql.gz"
out, err = run(db_dump_cmd)
print("OUT:", out)
if err.strip(): print("ERR:", err)

print("\nStep 3: Package mail directory (alphakolect.com) with gzip...")
mail_zip_cmd = f"tar -czf {BASE}/backups/alphakolect_mail.tar.gz -C /home/mayowae/mail alphakolect.com"
out, err = run(mail_zip_cmd)
print("OUT:", out)
if err.strip(): print("ERR:", err)

print("\nStep 4: Check backup files created...")
out, err = run(f"ls -lh {BASE}/backups")
print(out)

print("\nStep 5: Git add and commit backups...")
out, err = run(f"cd {BASE} && git add backups/ && git commit -m 'chore: add database and mail backups'")
print("OUT:", out)
if err.strip(): print("ERR:", err)

print("\nStep 6: Push backups to GitHub...")
out, err = run(f"cd {BASE} && git push origin main", timeout=180)
print("OUT:", out)
if err.strip(): print("ERR:", err)

client.close()
print("\nBackup and push completed!")
