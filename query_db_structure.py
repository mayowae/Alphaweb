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

    # Query table columns
    cmd = 'psql "postgresql://alpha_admin:AlphaWeb2026!@localhost:5432/alphacollect_db" -c "\\d wallet_transactions"'
    print("=== wallet_transactions table structure ===")
    print(run(cmd))

    # Also check if there's any other transaction table
    print("\n=== all tables ===")
    print(run('psql "postgresql://alpha_admin:AlphaWeb2026!@localhost:5432/alphacollect_db" -c "\\dt"'))

    client.close()
except Exception as e:
    print(f"Failed: {e}")
