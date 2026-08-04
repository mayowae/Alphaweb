import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

hostname = '159.198.36.24'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect(hostname, port=22, username='root', password=password, timeout=30)
    print("Connected successfully")
    
    def run(cmd):
        print(f"\n--- {cmd} ---")
        stdin, stdout, stderr = client.exec_command(cmd)
        print(stdout.read().decode('utf-8', errors='replace'))
        err = stderr.read().decode('utf-8', errors='replace')
        if err: print(f"ERR: {err}")

    # Final port check
    run("ss -tulpn | grep :3000")
    run("ps aux | grep next")
    
    # Try a local curl inside the server
    run("curl -I http://localhost:3000")
    
    client.close()
except Exception as e:
    print(f"Failed: {e}")
