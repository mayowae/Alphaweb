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

    # Query investment transactions for customer 1
    cmd = 'psql "postgresql://alpha_admin:AlphaWeb2026!@localhost:5432/alphacollect_db" -c "SELECT * FROM investment_transactions WHERE customer_id = 1 LIMIT 5"'
    print("=== investment_transactions for customer 1 ===")
    print(run(cmd))

    # Query collections for customer 1
    cmd = 'psql "postgresql://alpha_admin:AlphaWeb2026!@localhost:5432/alphacollect_db" -c "SELECT * FROM collections WHERE customer_id = 1 AND status = \'Collected\' LIMIT 5"'
    print("\n=== Collected collections for customer 1 ===")
    print(run(cmd))

    client.close()
except Exception as e:
    print(f"Failed: {e}")
