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

print("Step 1: Set safe.directory config in git...")
out, err = run("git config --global --add safe.directory /home/mayowae/bhislass.com")
print("OUT:", out)
if err.strip(): print("ERR:", err)

print("\nStep 2: Configure Git user details...")
run(f"cd {BASE} && git config user.name 'charlly-code' && git config user.email 'charlly-code@users.noreply.github.com'")

print("\nStep 3: Setup remote URL...")
run(f"cd {BASE} && git remote remove origin 2>/dev/null")
out, err = run(f"cd {BASE} && git remote add origin git@github.com:charlly-code/bhislass.git")
print("Remote add OUT:", out)
if err.strip(): print("Remote add ERR:", err)

print("\nStep 4: Git status before adding...")
out, _ = run(f"cd {BASE} && git status --short | head -20")
print(out)

print("\nStep 5: Git add all files...")
out, err = run(f"cd {BASE} && git add -A")
print("Git add OUT:", out)
if err.strip(): print("Git add ERR:", err)

print("\nStep 6: Git commit...")
out, err = run(f"cd {BASE} && git commit -m 'first commit - bhislass.com site files, database and mail backups'")
print("Git commit OUT:", out)
if err.strip(): print("Git commit ERR:", err)

print("\nStep 7: Git branch rename...")
out, err = run(f"cd {BASE} && git branch -M main")
print("Branch rename OUT:", out)

print("\nStep 8: Push to GitHub...")
out, err = run(f"cd {BASE} && git push -u -f origin main", timeout=600)
print("Git push OUT:", out)
if err.strip(): print("Git push ERR:", err)

client.close()
print("\nDone!")
