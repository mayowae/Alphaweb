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

    print("=== collectionController.js creation logic ===")
    print(run("grep -C 5 'create' /home/mayowae/public_html/alphaweb/backend/controllers/collectionController.js | head -n 50"))
    
    print("\n=== loanController.js disbursement logic ===")
    print(run("grep -C 5 'disburse\\|Approve' /home/mayowae/public_html/alphaweb/backend/controllers/loanController.js | head -n 50"))

    client.close()
except Exception as e:
    print(f"Failed: {e}")
