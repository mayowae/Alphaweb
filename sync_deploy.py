import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run(cmd):
    print(f"Executing: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    # Use a loop to read output in real-time or just wait
    return stdout.read().decode('utf-8'), stderr.read().decode('utf-8')

app_dir = '/home/mayowae/public_html/alphaweb'

print("Stopping PM2 processes...")
run("pm2 stop all")

import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

print("Rebuilding Frontend...")
# Run build. We might need to increase memory limit for Next.js build
stdout, stderr = run(f"cd {app_dir} && NODE_OPTIONS='--max-old-space-size=2048' npm run build")
with open('build_log.txt', 'w', encoding='utf-8') as f:
    f.write(stdout)
    f.write(stderr)

if "Error" in stderr or "Failed" in stdout:
    print("Build might have failed. Check build_log.txt")
else:
    print("Build seems successful.")

print("Restarting Backend...")
run("pm2 start 0") # alphaweb-backend

print("Restarting Frontend...")
run("pm2 start 2") # alphaweb-frontend

print("Checking PM2 status...")
stdout, _ = run("pm2 list")
print(stdout)

client.close()
