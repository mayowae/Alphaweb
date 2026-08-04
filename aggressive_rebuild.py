import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

hostname = '159.198.36.24'
password = '96eUC4aTbMu1o3yAP2'
FRONTEND_PATH = '/home/mayowae/public_html/alphaweb'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect(hostname, port=22, username='root', password=password, timeout=30)
    print("Connected successfully")
    
    def run(cmd):
        print(f"\n--- {cmd} ---")
        stdin, stdout, stderr = client.exec_command(cmd)
        
        # Read stdout in real-time or as chunks
        while True:
            line = stdout.readline()
            if not line: break
            print(line, end='')
            
        err = stderr.read().decode('utf-8', errors='replace')
        if err: print(f"\nERR: {err}")

    # Aggressive clean and rebuild
    run(f"cd {FRONTEND_PATH} && rm -rf .next && npm run build")
    run("pm2 restart alphaweb-frontend")
    
    client.close()
except Exception as e:
    print(f"Failed: {e}")
