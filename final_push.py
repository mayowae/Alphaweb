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

print("Adding remote origin...")
# Use git remote remove first just in case
run(ssh, f"cd {cwd} && git remote remove origin")
run(ssh, f"cd {cwd} && git remote add origin git@github.com:mayowae/Alphaweb.git")

print("Checking remote...")
print(run(ssh, f"cd {cwd} && git remote -v"))

print("Final push...")
push_res = run(ssh, f"cd {cwd} && git push -u origin main --force")
print(push_res)

ssh.close()
