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

# Write it to the VPS
write_cmd = f"cat > /tmp/test_smtp.js << 'EOF'\n{js_content}\nEOF"
run(ssh, write_cmd)

# Run it
# We need to run it from a place where nodemailer is installed, or install it in /tmp
print("\n--- Running SMTP Test ---")
run_cmd = "cd /home/mayowae/public_html/alphaweb/backend && node /tmp/test_smtp.js"
print(run(ssh, run_cmd))

ssh.close()
