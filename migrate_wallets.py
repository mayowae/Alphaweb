import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('159.198.36.24', 22, 'root', '96eUC4aTbMu1o3yAP2')

sql = """
ALTER TABLE customer_wallets ADD COLUMN IF NOT EXISTS collection_balance DECIMAL(15, 2) DEFAULT 0.00;
ALTER TABLE customer_wallets ADD COLUMN IF NOT EXISTS loan_balance DECIMAL(15, 2) DEFAULT 0.00;
ALTER TABLE customer_wallets ADD COLUMN IF NOT EXISTS investment_balance DECIMAL(15, 2) DEFAULT 0.00;
"""

cmd = f"sudo -u postgres psql alphacollect_db -c \"{sql}\""
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode())
print(stderr.read().decode())
client.close()
