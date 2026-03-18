import paramiko
import json

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

jlist = run(ssh, "pm2 jlist")
apps = json.loads(jlist)
for app in apps:
    if app['name'] == 'alphaweb-backend':
        print(f"App: {app['name']}")
        print(f"Error Log: {app['pm2_env']['pm_err_log_path']}")
        print(f"Out Log: {app['pm2_env']['pm_out_log_path']}")

ssh.close()
