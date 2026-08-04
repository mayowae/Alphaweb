import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

HOST = '159.198.36.24'
PASSWORD = 'yft1x2X89Z0MZrAvM9'
BASE = '/home/mayowae/public_html/alphaweb'

FILES = {
    'investment_overfunding': f'{BASE}/backend/controllers/investmentTransactionController.js',
    'charge_wallet_deduct': f'{BASE}/backend/controllers/chargeController.js',
    'collection_post': f'{BASE}/backend/controllers/collectionController.js',
    'wallet_model': f'{BASE}/backend/models/customerWallet.js',
    'customer_detail': f'{BASE}/src/app/dashboard/customer/[id]/page.tsx',
    'charges_page': f'{BASE}/src/app/dashboard/(pages)/charges/page.tsx',
    'customers_page': f'{BASE}/src/app/dashboard/(pages)/customer/page.tsx',
    'staff_page': f'{BASE}/src/app/dashboard/(pages)/staffManagement/page.tsx',
    'api': f'{BASE}/services/api.tsx',
}

PATTERNS = {
    'investment_overfunding': ['targetAmount', 'totalDeposited + investedAmount'],
    'investment_interest': ['transactionType: \'interest\'', 'INVESTMENT_RETURNS'],
    'investment_closed': ["status: 'Closed'", 'no further postings'],
    'investment_withdrawal': ['totalPrincipal + totalInterest', 'investmentDaysRequired'],
    'charge_wallet_deduct': ['collectionBalance', 'WalletTransaction.create'],
    'collection_post': ['postToCollection', 'collectionBalance'],
    'wallet_model': ['collectionBalance', 'loanBalance', 'investmentBalance'],
    'customer_detail': ['fetchInvestmentTransactions', 'fetchLoanApplications', 'postToCollection'],
    'charges_page': ['if (!isOpen) return null', 'onReassign', 'updateChargeAssignmentStatus'],
    'customers_page': ['handleExport', 'ReassignSidebar', 'showFilters'],
    'staff_page': ['[name]: value', 'if (!isOpen) return null'],
    'api': ['/charges/assignments/status', "method: 'PUT'"],
}

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, 22, 'root', PASSWORD, timeout=30)

print('=== LIVE SERVER VERIFICATION ===\n')
for name, path in FILES.items():
    cmd = f'test -f "{path}" && echo EXISTS || echo MISSING'
    i, o, e = ssh.exec_command(cmd)
    status = o.read().decode().strip()
    print(f'{name}: {status}')

print('\n=== PATTERN CHECKS ===\n')
for group, patterns in PATTERNS.items():
    if group in FILES:
        path = FILES[group]
    elif group.startswith('investment_'):
        path = FILES['investment_overfunding'].replace('investment_overfunding', 'investmentTransactionController.js')
        path = f'{BASE}/backend/controllers/investmentTransactionController.js'
    else:
        continue
    if group.startswith('investment_'):
        path = f'{BASE}/backend/controllers/investmentTransactionController.js'
    elif group == 'api':
        path = FILES['api']
    else:
        path = FILES.get(group.split('_')[0] + '_' + '_'.join(group.split('_')[1:]), None)
    
# redo cleanly
checks = [
    ('Over-funding validation', f'{BASE}/backend/controllers/investmentTransactionController.js', 'totalDeposited + investedAmount > targetAmount'),
    ('Interest generation', f'{BASE}/backend/controllers/investmentTransactionController.js', "transactionType: 'interest'"),
    ('Closed status block', f'{BASE}/backend/controllers/investmentTransactionController.js', 'no further postings are allowed'),
    ('Withdrawal principal+interest', f'{BASE}/backend/controllers/investmentTransactionController.js', 'totalPrincipal + totalInterest'),
    ('Withdrawal days check', f'{BASE}/backend/controllers/investmentTransactionController.js', 'investmentDaysRequired'),
    ('Charge wallet deduction', f'{BASE}/backend/controllers/chargeController.js', 'collectionBalance'),
    ('Mark as paid API path', f'{BASE}/services/api.tsx', '/charges/assignments/status'),
    ('Collection wallet post', f'{BASE}/backend/controllers/collectionController.js', 'collectionBalance'),
    ('Customer loan/investment data', f'{BASE}/src/app/dashboard/customer/[id]/page.tsx', 'fetchInvestmentTransactions'),
    ('Customer postToCollection', f'{BASE}/src/app/dashboard/customer/[id]/page.tsx', 'postToCollection'),
    ('Charges reassign wired', f'{BASE}/src/app/dashboard/(pages)/charges/page.tsx', 'onReassign'),
    ('Charges sidebar fix', f'{BASE}/src/app/dashboard/(pages)/charges/page.tsx', 'if (!isOpen) return null'),
    ('Customers filter/export', f'{BASE}/src/app/dashboard/(pages)/customer/page.tsx', 'handleExport'),
    ('Customers reassign', f'{BASE}/src/app/dashboard/(pages)/customer/page.tsx', 'ReassignSidebar'),
    ('Staff typing fix', f'{BASE}/src/app/dashboard/(pages)/staffManagement/page.tsx', '[name]: value'),
    ('Wallet balance fields', f'{BASE}/backend/models/customerWallet.js', 'investmentBalance'),
    ('Closed enum in model', f'{BASE}/backend/models/investmentApplication.js', "'Closed'"),
]

for label, path, pattern in checks:
    cmd = f'grep -F "{pattern}" "{path}" | head -1'
    i, o, e = ssh.exec_command(cmd)
    out = o.read().decode().strip()
    ok = bool(out)
    print(f"{'PASS' if ok else 'FAIL'} - {label}")

# PM2 status
print('\n=== PM2 STATUS ===')
i, o, e = ssh.exec_command('pm2 jlist')
import json
try:
    procs = json.loads(o.read().decode())
    for p in procs:
        print(f"{p.get('name')}: {p.get('pm2_env',{}).get('status')}")
except Exception as ex:
    print('Could not parse pm2 status')

ssh.close()
