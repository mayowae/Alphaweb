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
    stdin, stdout, stderr = client.exec_command(cmd, timeout=900)
    
    # Read output in chunks to avoid blocking and show progress
    while True:
        line = stdout.readline()
        if not line: break
        print(line, end='')
    
    err = stderr.read().decode('utf-8', errors='replace')
    if err:
        print("\nERRORS:")
        print(err)

print("=== CHECKING DISK SPACE ===")
run("df -h")

print("\n=== CHECKING IF .next EXISTS ===")
run(f"ls -la {FRONTEND_PATH}/.next || echo 'NOT FOUND'")

print("\n=== TRYING TO BUILD MANUALLY ===")
run(f"cd {FRONTEND_PATH} && export NODE_OPTIONS='--max-old-space-size=2048' && npm run build")

print("\n=== STARTING FRONTEND AFTER BUILD ===")
run(f"pm2 restart alphaweb-frontend || (cd {FRONTEND_PATH} && pm2 start npm --name alphaweb-frontend -- start)")

client.close()
