import paramiko
import time

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'
BASE = '/home/mayowae/public_html/alphaweb'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOSTNAME, port=22, username=USERNAME, password=PASSWORD)

def run(cmd, timeout=60):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

print("Step 1: Stash all current working directory changes...")
out, err = run(f'cd {BASE} && git stash --include-untracked')
print("OUT:", out)
if err.strip(): print("ERR:", err)

time.sleep(1)
print("\nStep 2: Abort the stuck interactive rebase...")
out, err = run(f'cd {BASE} && git rebase --abort')
print("OUT:", out)
if err.strip(): print("ERR:", err)

time.sleep(1)
print("\nStep 3: Verify we're back on main branch...")
out, _ = run(f'cd {BASE} && git branch && git log --oneline -3')
print(out)

print("\nStep 4: Pop the stash to restore all changes...")
out, err = run(f'cd {BASE} && git stash pop')
print("OUT:", out)
if err.strip(): print("ERR:", err)

time.sleep(1)
print("\nStep 5: Git status after stash pop...")
out, _ = run(f'cd {BASE} && git status --short | wc -l')
print("Total changed files:", out.strip())

print("\nStep 6: Stage all changes (respecting .gitignore)...")
out, err = run(f'cd {BASE} && git add -A')
print("OUT:", out)
if err.strip(): print("ERR:", err)

print("\nStep 7: Show what will be committed (summary)...")
out, _ = run(f'cd {BASE} && git diff --cached --stat | tail -5')
print(out)

print("\nStep 8: Commit all changes...")
commit_msg = "chore: sync live server state - subscription fix, export buttons, loan/investment page filters, agent view, customer detail overhaul"
out, err = run(f'cd {BASE} && git commit -m "{commit_msg}"')
print("OUT:", out)
if err.strip(): print("ERR:", err)

print("\nStep 9: Push to GitHub...")
out, err = run(f'cd {BASE} && git push origin main', timeout=120)
print("OUT:", out)
if err.strip(): print("ERR:", err)

print("\nStep 10: Verify final git log...")
out, _ = run(f'cd {BASE} && git log --oneline -5')
print(out)

client.close()
print("\nDone!")
