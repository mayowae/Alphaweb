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

    def run(cmd):
        stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
        return stdout.read().decode('utf-8', errors='replace')

    # Check what routes customer-wallets has
    print("=== customer-wallets routes ===")
    print(run("grep -n 'customer-wallets' /home/mayowae/public_html/alphaweb/backend/server.js | head -30"))

    # Check what the wallet stats endpoint returns for customer 1
    print("\n=== Try /customer-wallets?customerId=1 ===")
    print(run("curl -s 'http://localhost:5000/customer-wallets?customerId=1' | python3 -c \"import sys,json; d=json.load(sys.stdin); print(json.dumps(d, indent=2))\" 2>&1 | head -c 1000"))

    # Check wallet transactions table
    print("\n=== WalletTransaction model/routes ===")
    print(run("grep -rn 'WalletTransaction\\|wallet-transactions\\|walletTransaction' /home/mayowae/public_html/alphaweb/backend/server.js | head -20"))

    client.close()
except Exception as e:
    print(f"Failed: {e}")
