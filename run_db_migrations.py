import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

HOST = '159.198.36.24'
PASSWORD = 'yft1x2X89Z0MZrAvM9'

SQL = """
ALTER TABLE customer_wallets ADD COLUMN IF NOT EXISTS collection_balance DECIMAL(15, 2) DEFAULT 0.00;
ALTER TABLE customer_wallets ADD COLUMN IF NOT EXISTS loan_balance DECIMAL(15, 2) DEFAULT 0.00;
ALTER TABLE customer_wallets ADD COLUMN IF NOT EXISTS investment_balance DECIMAL(15, 2) DEFAULT 0.00;
"""

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, 'root', PASSWORD, timeout=30)

# Write SQL file on server and execute
sftp = ssh.open_sftp()
with sftp.open('/tmp/alphaweb_migrate.sql', 'w') as f:
    f.write(SQL)
sftp.close()

for cmd in [
    'sudo -u postgres psql alphacollect_db -f /tmp/alphaweb_migrate.sql',
    """sudo -u postgres psql alphacollect_db -c "ALTER TYPE enum_investment_applications_status ADD VALUE IF NOT EXISTS 'Closed';" 2>/dev/null || sudo -u postgres psql alphacollect_db -c "SELECT 1;" """,
    'rm /tmp/alphaweb_migrate.sql',
]:
    print(f'\n>>> {cmd}')
    stdin, stdout, stderr = ssh.exec_command(cmd)
    print(stdout.read().decode('utf-8', errors='replace'))
    err = stderr.read().decode('utf-8', errors='replace')
    if err.strip():
        print('STDERR:', err)

ssh.close()
print('Migrations done.')
