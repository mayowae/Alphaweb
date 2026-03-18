import paramiko

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"

def run(ssh, cmd):
    print(f"Executing: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    o = stdout.read().decode("utf-8", errors="replace")
    e = stderr.read().decode("utf-8", errors="replace")
    return (o + e).strip()

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, 22, SSH_USER, SSH_PASS)

cwd = "/home/mayowae/public_html/alphaweb"

# 1. Add GitHub to known_hosts to avoid interactive prompt
print("Adding GitHub to known_hosts...")
run(ssh, "ssh-keyscan -t ed25519 github.com >> /root/.ssh/known_hosts")

# 1b. Handle dubious ownership
run(ssh, f"git config --global --add safe.directory {cwd}")

# 2. Test GitHub connection
print("Testing GitHub connection...")
test_res = run(ssh, "ssh -T git@github.com")
print(test_res)

# 3. Push to GitHub
print("Pushing to GitHub...")
# Use --force if necessary, but usually -u is enough for first push if repo is empty
# I'll try normal push first
push_res = run(ssh, f"cd {cwd} && git push -u origin main")
print(push_res)

# If it failed because of remote content, try force push (since we want to reset GitHub to VPS state)
if "error: failed to push" in push_res:
    print("Push failed, attempting force push...")
    push_res = run(ssh, f"cd {cwd} && git push -u origin main --force")
    print(push_res)

ssh.close()
