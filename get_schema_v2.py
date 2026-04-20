import paramiko
import sys
sys.stdout.reconfigure(encoding='utf-8')

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname, port=port, username=username, password=password)

db_url = "postgresql://alpha_admin:AlphaWeb2026!@localhost:5432/alphacollect_db"

def run_query(query):
    stdin, stdout, stderr = ssh.exec_command(f'psql "{db_url}" -c "{query}"')
    return stdout.read().decode('utf-8', errors='ignore'), stderr.read().decode('utf-8', errors='ignore')

print("=== Checking remittances table ===")
out, err = run_query("\\d remittances")
print(out or err)

print("\n=== Checking customer_wallets table ===")
out, err = run_query("\\d customer_wallets")
print(out or err)

print("\n=== Checking wallet_transactions table ===")
out, err = run_query("\\d wallet_transactions")
print(out or err)

print("\n=== Checking activities table ===")
out, err = run_query("\\d activities")
print(out or err)

ssh.close()
