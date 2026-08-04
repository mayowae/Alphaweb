import paramiko
import sys
sys.stdout.reconfigure(encoding='utf-8')

hostname = '159.198.36.24'
FRONTEND_PATH = '/home/mayowae/public_html/alphaweb'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=22, username='root', password='96eUC4aTbMu1o3yAP2', timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8') + stderr.read().decode('utf-8')

print("=== DISK SPACE ===")
print(run("df -h /"))

print("\n=== DIRECTORY CONTENT ===")
print(run(f"ls -F {FRONTEND_PATH}"))

print("\n=== .next CONTENT ===")
print(run(f"ls -F {FRONTEND_PATH}/.next"))

print("\n=== PM2 LIST ===")
print(run("pm2 list --no-color"))

client.close()
