import paramiko
import time

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'
BASE = '/home/mayowae/kosheglobal.com'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOSTNAME, port=22, username=USERNAME, password=PASSWORD)

def run(cmd, timeout=300):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

print("Step 1: Set safe.directory config in git...")
out, err = run("git config --global --add safe.directory /home/mayowae/kosheglobal.com")
print("OUT:", out)
if err.strip(): print("ERR:", err)

print("\nStep 2: Initialize Git repository...")
out, err = run(f"cd {BASE} && git init")
print("OUT:", out)
if err.strip(): print("ERR:", err)

# Configure user
run(f"cd {BASE} && git config user.name 'charlly-code' && git config user.email 'charlly-code@users.noreply.github.com'")

print("\nStep 3: Create backups directory...")
out, err = run(f"mkdir -p {BASE}/backups")
print("OUT:", out)
if err.strip(): print("ERR:", err)

print("\nStep 4: Dump MySQL database (mayowae_wp992) with gzip...")
db_dump_cmd = f"mysqldump -u mayowae_wp992 -p\"J2pS8972(]\" mayowae_wp992 | gzip > {BASE}/backups/kosheglobal_wp.sql.gz"
out, err = run(db_dump_cmd)
print("OUT:", out)
if err.strip(): print("ERR:", err)

print("\nStep 5: Package mail directory (kosheglobal.com)...")
mail_zip_cmd = f"tar -czf {BASE}/backups/kosheglobal_mail.tar.gz -C /home/mayowae/mail kosheglobal.com"
out, err = run(mail_zip_cmd)
print("Tar OUT:", out)
if err.strip(): print("Tar ERR:", err)

print("\nStep 6: Write .gitignore and README.md...")
gitignore_content = """/koshebak.zip
/koshebak
/error_log
"""
run(f"cat << 'EOF' > {BASE}/.gitignore\n{gitignore_content}EOF")

readme_content = """# Koshe Global Website Backup

This repository contains the files, database, and email backups for `kosheglobal.com`.

## Restoring Mails
To restore the mail directory:
1. Extract the mailbox archive to your mail directory:
   ```bash
   tar -xzf backups/kosheglobal_mail.tar.gz -C /home/mayowae/mail/
   ```

## Restoring Database
The database dump is located at `backups/kosheglobal_wp.sql.gz`. To restore it:
1. Unzip the SQL dump:
   ```bash
   gunzip -c backups/kosheglobal_wp.sql.gz > backups/kosheglobal_wp.sql
   ```
2. Import the SQL file:
   ```bash
   mysql -u [db_user] -p [db_name] < backups/kosheglobal_wp.sql
   ```
"""
run(f"cat << 'EOF' > {BASE}/README.md\n{readme_content}EOF")

print("\nStep 7: Check backups folder contents...")
out, err = run(f"ls -lh {BASE}/backups")
print(out)

print("\nStep 8: Add remote and commit files...")
run(f"cd {BASE} && git remote remove origin 2>/dev/null")
out, err = run(f"cd {BASE} && git remote add origin git@github.com:charlly-code/kosheglobal.git")
print("Remote add OUT:", out)
if err.strip(): print("Remote add ERR:", err)

# Git add all files
out, err = run(f"cd {BASE} && git add -A")
print("Git add OUT:", out)
if err.strip(): print("Git add ERR:", err)

# Git commit
out, err = run(f"cd {BASE} && git commit -m 'first commit - kosheglobal.com site files, database and mail backups'")
print("Git commit OUT:", out)
if err.strip(): print("Git commit ERR:", err)

# Git branch rename
out, err = run(f"cd {BASE} && git branch -M main")
print("Branch rename OUT:", out)

print("\nStep 9: Push to GitHub...")
out, err = run(f"cd {BASE} && git push -u -f origin main", timeout=300)
print("Git push OUT:", out)
if err.strip(): print("Git push ERR:", err)

client.close()
print("\nDone!")
