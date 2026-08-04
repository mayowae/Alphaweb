import paramiko
import sys
sys.stdout.reconfigure(encoding='utf-8')

hostname = '159.198.36.24'
FRONTEND_PATH = '/home/mayowae/public_html/alphaweb'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=22, username='root', password='96eUC4aTbMu1o3yAP2', timeout=30)

def run(cmd):
    print(f"\n--- Running: {cmd} ---")
    stdin, stdout, stderr = client.exec_command(cmd)
    
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    return out, err

print("=== CLEANING .next ===")
run(f"rm -rf {FRONTEND_PATH}/.next")

print("\n=== RUNNING BUILD AND CAPTURING OUTPUT ===")
# Use npx directly to avoid any alias/path issues
out, err = run(f"cd {FRONTEND_PATH} && export NODE_OPTIONS='--max-old-space-size=2048' && ./node_modules/.bin/next build")

print("\nSTDOUT:")
print(out)
print("\nSTDERR:")
print(err)

client.close()
