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

print("=== Pending Remittances ===")
out, err = run_query("SELECT id, customer_name, amount, collection_id FROM remittances WHERE status = 'Pending';")
print(out)

print("\n=== Pending Collections ===")
out, err = run_query("SELECT id, customer_name, amount, status FROM collections WHERE status = 'Pending' LIMIT 10;")
print(out)

ssh.close()
