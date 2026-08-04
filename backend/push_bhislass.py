import paramiko
import time

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'
BASE = '/home/mayowae/bhislass.com'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOSTNAME, port=22, username=USERNAME, password=PASSWORD)

def run(cmd, timeout=300):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

print("Step 1: Initialize Git repository...")
out, err = run(f"cd {BASE} && git init")
print("OUT:", out)
if err.strip(): print("ERR:", err)

# Configure user
run(f"cd {BASE} && git config user.name 'charlly-code' && git config user.email 'charlly-code@users.noreply.github.com'")

print("\nStep 2: Create backups directory...")
out, err = run(f"mkdir -p {BASE}/backups")
print("OUT:", out)
if err.strip(): print("ERR:", err)

print("\nStep 3: Dump MySQL database (mayowae_wp654) with gzip...")
db_dump_cmd = f"mysqldump -u mayowae_wp654 -ppt9195\(4\(S mayowae_wp654 | gzip > {BASE}/backups/bhislass_wp.sql.gz"
out, err = run(db_dump_cmd)
print("OUT:", out)
if err.strip(): print("ERR:", err)

print("\nStep 4: Package and split mail directory (bhislass.com)...")
# Compress to /tmp
run("rm -f /tmp/bhislass_mail.tar.gz")
out, err = run("tar -czf /tmp/bhislass_mail.tar.gz -C /home/mayowae/mail bhislass.com")
print("Tar compression OUT:", out)
if err.strip(): print("Tar compression ERR:", err)

# Split into 50MB parts directly in backups/
run(f"rm -f {BASE}/backups/bhislass_mail.tar.gz.part_*")
out, err = run(f"split -b 50M /tmp/bhislass_mail.tar.gz {BASE}/backups/bhislass_mail.tar.gz.part_")
print("Split OUT:", out)
if err.strip(): print("Split ERR:", err)

# Remove tmp file
run("rm -f /tmp/bhislass_mail.tar.gz")

print("\nStep 5: Write .gitignore and README.md...")
gitignore_content = """/BHISLassBak.zip
/admin.zip
/user.zip
/error_log
"""
# Write gitignore using cat EOF
run(f"cat << 'EOF' > {BASE}/.gitignore\n{gitignore_content}EOF")

readme_content = """# Bhislass.com Website Backup

This repository contains the files, database, and email backups for `bhislass.com`.

## Restoring Mails
The mail archive was compressed and split into 50MB parts to fit GitHub file limits. To restore the mail directory:
1. Concatenate the split parts:
   ```bash
   cat backups/bhislass_mail.tar.gz.part_* > backups/bhislass_mail.tar.gz
   ```
2. Extract the mailbox archive to your mail directory:
   ```bash
   tar -xzf backups/bhislass_mail.tar.gz -C /home/mayowae/mail/
   ```

## Restoring Database
The database dump is located at `backups/bhislass_wp.sql.gz`. To restore it:
1. Unzip the SQL dump:
   ```bash
   gunzip -c backups/bhislass_wp.sql.gz > backups/bhislass_wp.sql
   ```
2. Import the SQL file:
   ```bash
   mysql -u [db_user] -p [db_name] < backups/bhislass_wp.sql
   ```
"""
run(f"cat << 'EOF' > {BASE}/README.md\n{readme_content}EOF")

print("\nStep 6: Show backups folder contents...")
out, err = run(f"ls -lh {BASE}/backups")
print(out)

print("\nStep 7: Add remote and commit files...")
run(f"cd {BASE} && git remote remove origin 2>/dev/null")
out, err = run(f"cd {BASE} && git remote add origin git@github.com:charlly-code/bhislass.git")
print("Remote add OUT:", out)
if err.strip(): print("Remote add ERR:", err)

# Git add all files
out, err = run(f"cd {BASE} && git add -A")
print("Git add OUT:", out)
if err.strip(): print("Git add ERR:", err)

# Git commit
out, err = run(f"cd {BASE} && git commit -m 'first commit - bhislass.com site files, database and mail backups'")
print("Git commit OUT:", out)
if err.strip(): print("Git commit ERR:", err)

# Git branch rename
out, err = run(f"cd {BASE} && git branch -M main")
print("Branch rename OUT:", out)

print("\nStep 8: Push to GitHub...")
# Try pushing to main (force push is safer for initial commit if repo is already created)
out, err = run(f"cd {BASE} && git push -u -f origin main", timeout=600)
print("Git push OUT:", out)
if err.strip(): print("Git push ERR:", err)

client.close()
print("\nDone!")
