import paramiko
import os
import sys
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

HOST = '159.198.36.24'
PORT = 22
USER = 'root'
PASSWORD = 'yft1x2X89Z0MZrAvM9'
BASE = r'c:\Users\trade\Documents\Alphaweb-main'
REMOTE = '/home/mayowae/public_html/alphaweb'

FILES = [
    # Backend models
    ('backend/models/investmentApplication.js', 'backend/models/investmentApplication.js'),
    ('backend/models/customerWallet.js', 'backend/models/customerWallet.js'),
    # Backend controllers
    ('backend/controllers/investmentTransactionController.js', 'backend/controllers/investmentTransactionController.js'),
    ('backend/controllers/chargeController.js', 'backend/controllers/chargeController.js'),
    ('backend/controllers/collectionController.js', 'backend/controllers/collectionController.js'),
    ('backend/controllers/loanController.js', 'backend/controllers/loanController.js'),
    ('backend/controllers/customerWalletController.js', 'backend/controllers/customerWalletController.js'),
    # Frontend
    ('services/api.tsx', 'services/api.tsx'),
    ('src/components/InvestmentTransactionForm.tsx', 'src/components/InvestmentTransactionForm.tsx'),
    ('src/app/dashboard/customer/[id]/page.tsx', 'src/app/dashboard/customer/[id]/page.tsx'),
    ('src/app/dashboard/(pages)/charges/page.tsx', 'src/app/dashboard/(pages)/charges/page.tsx'),
    ('src/app/dashboard/(pages)/staffManagement/page.tsx', 'src/app/dashboard/(pages)/staffManagement/page.tsx'),
]

SQL_MIGRATIONS = """
ALTER TABLE customer_wallets ADD COLUMN IF NOT EXISTS collection_balance DECIMAL(15, 2) DEFAULT 0.00;
ALTER TABLE customer_wallets ADD COLUMN IF NOT EXISTS loan_balance DECIMAL(15, 2) DEFAULT 0.00;
ALTER TABLE customer_wallets ADD COLUMN IF NOT EXISTS investment_balance DECIMAL(15, 2) DEFAULT 0.00;
DO $$ BEGIN
  ALTER TYPE enum_investment_applications_status ADD VALUE IF NOT EXISTS 'Closed';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
"""


def run(ssh, cmd, timeout=600):
    print(f'\n>>> {cmd}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out.strip():
        print(out)
    if err.strip():
        print('STDERR:', err)
    return out, err


def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f'Connecting to {HOST}...')
    ssh.connect(HOST, PORT, USER, PASSWORD, timeout=60)
    print('Connected.')

    # Upload files
    sftp = ssh.open_sftp()
    for local_rel, remote_rel in FILES:
        local_path = os.path.join(BASE, local_rel)
        remote_path = f'{REMOTE}/{remote_rel}'.replace('\\', '/')
        if not os.path.exists(local_path):
            print(f'WARNING: missing local file: {local_path}')
            continue
        remote_dir = os.path.dirname(remote_path)
        ssh.exec_command(f'mkdir -p "{remote_dir}"')
        print(f'Uploading {local_rel}...')
        sftp.put(local_path, remote_path)
    sftp.close()
    print('\nAll files uploaded.')

    # DB migrations
    print('\n--- Running DB migrations ---')
    sql_escaped = SQL_MIGRATIONS.replace('"', '\\"').replace('\n', ' ')
    run(ssh, f'sudo -u postgres psql alphacollect_db -c "{sql_escaped}"', timeout=60)

    # Restart backend
    print('\n--- Restarting backend ---')
    run(ssh, 'pm2 restart alphaweb-backend')

    # Rebuild frontend
    print('\n--- Building frontend (may take several minutes) ---')
    out, err = run(
        ssh,
        f"cd {REMOTE} && NODE_OPTIONS='--max-old-space-size=2048' npm run build",
        timeout=900
    )
    if 'error' in (out + err).lower() and 'compiled successfully' not in (out + err).lower():
        print('WARNING: build may have issues — check output above')

    # Restart frontend
    print('\n--- Restarting frontend ---')
    run(ssh, 'pm2 restart alphaweb-frontend')

    # Status check
    print('\n--- PM2 status ---')
    run(ssh, 'pm2 list')
    run(ssh, 'pm2 logs alphaweb-backend --lines 15 --nostream')

    ssh.close()
    print('\n=== DEPLOYMENT COMPLETE ===')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f'\nDEPLOYMENT FAILED: {e}')
        sys.exit(1)
