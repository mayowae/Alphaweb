import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

# Find project directory
project_dir = "/home/mayowae/public_html/alphaweb"
print(f"Checking directory: {project_dir}")

# Database URL from the previously loaded env:
db_url = "postgresql://alpha_admin:AlphaW3b%40Local2024@127.0.0.1:5432/alphacollect_db"

print(f"\nUsing DB URL: {db_url}")

# Run psql command to list tables
psql_cmd = f"psql \"{db_url}\" -c \"\\dt\""
out, err = run(psql_cmd)
print("\n=== Database Tables ===")
print(out)
if err:
    print("Errors:")
    print(err)

# Check if accounts table exists and list columns
psql_cmd_acc = f"psql \"{db_url}\" -c \"\\d accounts\""
out_acc, err_acc = run(psql_cmd_acc)
print("\n=== Accounts Table Schema ===")
print(out_acc)

# Check current accounts data
psql_cmd_data = f"psql \"{db_url}\" -c \"SELECT id, code, name, type, category, status FROM accounts ORDER BY code LIMIT 50;\""
out_data, err_data = run(psql_cmd_data)
print("\n=== Current Chart of Accounts ===")
print(out_data)

# Let's check some records in transactions or collections or other tables to understand transaction flows!
psql_cmd_tx = f"psql \"{db_url}\" -c \"SELECT id, type, amount, status FROM transactions LIMIT 5;\""
out_tx, err_tx = run(psql_cmd_tx)
print("\n=== Transactions table preview ===")
print(out_tx)

client.close()
