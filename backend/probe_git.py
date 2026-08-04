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

print('=== Git remote URL ===')
print(run(f'cd {BASE} && git remote -v')[0])

print('=== Git status (short) ===')
out, _ = run(f'cd {BASE} && git status --short | head -30')
print(out)

print('=== Total modified/untracked files ===')
out, _ = run(f'cd {BASE} && git status --short | wc -l')
print(out)

print('=== Current branch ===')
print(run(f'cd {BASE} && git branch')[0])

print('=== Git log last 3 commits ===')
print(run(f'cd {BASE} && git log --oneline -3')[0])

print('=== Check SSH keys ===')
print(run('ls -la ~/.ssh/ 2>/dev/null || echo "No .ssh dir"')[0])

print('=== Check git config user ===')
print(run(f'cd {BASE} && git config user.name && git config user.email')[0])

client.close()
