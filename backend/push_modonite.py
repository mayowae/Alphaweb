import paramiko
import os

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'
BASE = '/home/mayowae/modoniteintegrated.com.ng'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOSTNAME, port=22, username=USERNAME, password=PASSWORD)

def run(cmd, timeout=300):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

print("Step 1: Set safe.directory config in git...")
out, err = run("git config --global --add safe.directory /home/mayowae/modoniteintegrated.com.ng")
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

print("\nStep 4: Dump MySQL database (mayowae_wp186) with gzip...")
db_dump_cmd = f"mysqldump -u mayowae_wp186 -p\"p)@9SRp695\" mayowae_wp186 | gzip > {BASE}/backups/modonite_wp.sql.gz"
out, err = run(db_dump_cmd)
print("OUT:", out)
if err.strip(): print("ERR:", err)

print("\nStep 5: Package mail directory (modoniteintegrated.com.ng) and check size...")
run("rm -f /tmp/modonite_mail.tar.gz")
out, err = run("tar -czf /tmp/modonite_mail.tar.gz -C /home/mayowae/mail modoniteintegrated.com.ng")
print("Tar OUT:", out)
if err.strip(): print("Tar ERR:", err)

# Check size
out, _ = run("stat -c %s /tmp/modonite_mail.tar.gz")
size_bytes = int(out.strip()) if out.strip().isdigit() else 0
print(f"Compressed mail size: {size_bytes / (1024*1024):.2f} MB")

if size_bytes > 85 * 1024 * 1024:
    print("Size exceeds 85MB. Splitting into 50MB parts...")
    run(f"rm -f {BASE}/backups/modonite_mail.tar.gz.part_*")
    out, err = run(f"split -b 50M /tmp/modonite_mail.tar.gz {BASE}/backups/modonite_mail.tar.gz.part_")
    print("Split OUT:", out)
    if err.strip(): print("Split ERR:", err)
else:
    print("Size is under 85MB. Copying directly...")
    run(f"rm -f {BASE}/backups/modonite_mail.tar.gz")
    out, err = run(f"cp /tmp/modonite_mail.tar.gz {BASE}/backups/modonite_mail.tar.gz")
    print("Copy OUT:", out)
    if err.strip(): print("Copy ERR:", err)

run("rm -f /tmp/modonite_mail.tar.gz")

print("\nStep 6: Write .gitignore and README.md...")
gitignore_content = """/ModoniteBak.zip
/error_log
"""
run(f"cat << 'EOF' > {BASE}/.gitignore\n{gitignore_content}EOF")

readme_content = """# Modoniteintegrated.com.ng Website Backup

This repository contains the files, database, and email backups for `modoniteintegrated.com.ng`.

## Restoring Mails
To restore the mail directory:
- If the mail archive is split into parts (`.part_*`):
  1. Concatenate split files:
     ```bash
     cat backups/modonite_mail.tar.gz.part_* > backups/modonite_mail.tar.gz
     ```
  2. Extract:
     ```bash
     tar -xzf backups/modonite_mail.tar.gz -C /home/mayowae/mail/
     ```
- If not split:
  1. Extract:
     ```bash
     tar -xzf backups/modonite_mail.tar.gz -C /home/mayowae/mail/
     ```

## Restoring Database
The database dump is located at `backups/modonite_wp.sql.gz`. To restore it:
1. Unzip the SQL dump:
   ```bash
   gunzip -c backups/modonite_wp.sql.gz > backups/modonite_wp.sql
   ```
2. Import the SQL file:
   ```bash
   mysql -u [db_user] -p [db_name] < backups/modonite_wp.sql
   ```
"""
run(f"cat << 'EOF' > {BASE}/README.md\n{readme_content}EOF")

print("\nStep 7: Check backups folder contents...")
out, err = run(f"ls -lh {BASE}/backups")
print(out)

print("\nStep 8: Add remote and commit files...")
run(f"cd {BASE} && git remote remove origin 2>/dev/null")
out, err = run(f"cd {BASE} && git remote add origin git@github.com:charlly-code/modoniteintegrated.git")
print("Remote add OUT:", out)
if err.strip(): print("Remote add ERR:", err)

# Git add all files
out, err = run(f"cd {BASE} && git add -A")
print("Git add OUT:", out)
if err.strip(): print("Git add ERR:", err)

# Git commit
out, err = run(f"cd {BASE} && git commit -m 'first commit - modoniteintegrated.com.ng site files, database and mail backups'")
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
