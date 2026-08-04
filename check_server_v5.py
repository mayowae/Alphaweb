import paramiko
import os
import sys

# Set encoding for output
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
        out = stdout.read().decode('utf-8', errors='replace')
        print(out)
        err = stderr.read().decode('utf-8', errors='replace')
        if err: print(f"ERR: {err}")

    run("pm2 status")
    run("ss -tulpn | grep :3000")
    run("ls /etc/nginx/conf.d/")
    run("cat /etc/nginx/conf.d/alphakolect.com.conf 2>/dev/null || cat /etc/nginx/conf.d/paxalphaltd.com.conf 2>/dev/null")
    
    client.close()
except Exception as e:
    print(f"Failed: {e}")
