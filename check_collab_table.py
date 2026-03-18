import paramiko

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"

def run(ssh, cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    o = stdout.read().decode("utf-8", errors="replace")
    e = stderr.read().decode("utf-8", errors="replace")
    return (o + e).strip()

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, 22, SSH_USER, SSH_PASS)

print("--- Collaborators Table Structure ---")
db_url = "postgresql://alpha_admin:AlphaWeb2026!@localhost:5432/alphacollect_db"
cmd = f"PGPASSWORD='AlphaWeb2026!' psql \"{db_url}\" -c \"\\d collaborators\""
print(run(ssh, cmd))

ssh.close()
