import paramiko

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"

def run(ssh, cmd):
    print(f"Running: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    o = stdout.read().decode("utf-8", errors="replace")
    e = stderr.read().decode("utf-8", errors="replace")
    print(o + e)
    return (o + e).strip()

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, 22, SSH_USER, SSH_PASS)

cwd = "/home/mayowae/public_html/alphaweb"

# 1. Update .gitignore
gitignore_content = run(ssh, f"cat {cwd}/.gitignore")
if ".env" not in gitignore_content:
    print("Appending .env to .gitignore")
    run(ssh, f"echo '.env' >> {cwd}/.gitignore")
if ".env.local" not in gitignore_content:
    run(ssh, f"echo '.env.local' >> {cwd}/.gitignore")
if "logs/" not in gitignore_content:
    run(ssh, f"echo 'logs/' >> {cwd}/.gitignore")

# 2. Initialize Git
run(ssh, f"cd {cwd} && git init")
run(ssh, f"cd {cwd} && git config user.name 'Mayowa VPS'")
run(ssh, f"cd {cwd} && git config user.email 'mayowae@users.noreply.github.com'")

# 3. Commit
run(ssh, f"cd {cwd} && git add .")
run(ssh, f"cd {cwd} && git commit -m 'Initial commit from VPS'")
run(ssh, f"cd {cwd} && git branch -M main")

# 4. Check for SSH key
print("--- Checking for SSH key ---")
ssh_check = run(ssh, "ls -la /root/.ssh/id_rsa.pub")
if "No such file" in ssh_check or not ssh_check:
    print("Generating new SSH key...")
    run(ssh, "ssh-keygen -t rsa -b 4096 -f /root/.ssh/id_rsa -N ''")
    pub_key = run(ssh, "cat /root/.ssh/id_rsa.pub")
    print("\n\n################################################################")
    print("NEW SSH PUBLIC KEY GENERATED:")
    print(pub_key)
    print("################################################################\n\n")
    print("ACTION REQUIRED: Please add the above SSH key to your GitHub account (Settings > SSH and GPG keys).")
else:
    pub_key = run(ssh, "cat /root/.ssh/id_rsa.pub")
    print("\n\n################################################################")
    print("EXISTING SSH PUBLIC KEY:")
    print(pub_key)
    print("################################################################\n\n")

ssh.close()
