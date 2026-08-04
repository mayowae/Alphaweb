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

    def run(cmd, timeout=20):
        stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
        return stdout.read().decode('utf-8', errors='replace')

    # Just get the key parts of the wallet controller
    print("=== getCustomerWalletById includes ===")
    print(run("grep -A 30 'getCustomerWalletById' /home/mayowae/public_html/alphaweb/backend/controllers/customerWalletController.js | head -40"))

    print("\n=== CustomerWallet model associations ===")
    print(run("grep -n 'associate\\|hasMany\\|belongsTo\\|Transaction\\|WalletTx' /home/mayowae/public_html/alphaweb/backend/models/CustomerWallet.js 2>/dev/null | head -20"))

    print("\n=== Collections table - check for customer transaction fields ===")
    print(run("grep -rn 'customerId\\|customer_id' /home/mayowae/public_html/alphaweb/backend/models/CustomerWallet.js 2>/dev/null | head -10"))

    client.close()
except Exception as e:
    print(f"Failed: {e}")
