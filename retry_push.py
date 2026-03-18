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

print("Configuring safe directory...")
run(ssh, f"git config --global --add safe.directory {cwd}")

print("Adding and committing files...")
run(ssh, f"cd {cwd} && git add .")
commit_res = run(ssh, f"cd {cwd} && git commit -m 'Initial commit from VPS' --allow-empty")
print(commit_res)

print("Renaming branch to main...")
run(ssh, f"cd {cwd} && git branch -M main")

print("Pushing to GitHub...")
push_res = run(ssh, f"cd {cwd} && git push -u origin main --force")
print(push_res)

ssh.close()
