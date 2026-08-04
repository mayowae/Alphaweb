import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

hostname = '159.198.36.24'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect(hostname, port=22, username='root', password=password, timeout=10)
    print("Connected")

    def run(cmd):
        stdin, stdout, stderr = client.exec_command(cmd)
        return stdout.read().decode('utf-8', errors='replace')

    print("=== activity.js content ===")
    print(run("cat /home/mayowae/public_html/alphaweb/backend/models/activity.js"))

    client.close()
except Exception as e:
    print(f"Failed: {e}")
