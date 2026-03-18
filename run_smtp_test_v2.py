import paramiko

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"

def run(ssh, cmd):
    print(f"Executing: {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    o = stdout.read().decode("utf-8", errors="replace")
    e = stderr.read().decode("utf-8", errors="replace")
    return o + e

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, 22, SSH_USER, SSH_PASS)

# Read the local test_smtp.js
with open(r'c:\Users\trade\Documents\Alphaweb-main\test_smtp.js', 'r') as f:
    js_content = f.read()

PROJ_BACKEND = "/home/mayowae/public_html/alphaweb/backend"

# Write it to the project backend dir
write_cmd = f"cat > {PROJ_BACKEND}/test_smtp.js << 'EOF'\n{js_content}\nEOF"
run(ssh, write_cmd)

# Run it
print("\n--- Running SMTP Test ---")
run_cmd = f"cd {PROJ_BACKEND} && node test_smtp.js"
print(run(ssh, run_cmd))

# Cleanup
# run(ssh, f"rm {PROJ_BACKEND}/test_smtp.js")

ssh.close()
