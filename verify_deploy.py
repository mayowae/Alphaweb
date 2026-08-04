import paramiko

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'
REMOTE_BASE = '/home/mayowae/public_html/alphaweb'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOSTNAME, port=22, username=USERNAME, password=PASSWORD, timeout=30)
print("Connected")

def run(cmd):
    _, stdout, stderr = client.exec_command(cmd, timeout=60)
    out = stdout.read().decode('utf-8', errors='replace')
    return out.encode('ascii', errors='replace').decode('ascii')

# Check if "assignToAll" keyword is in the live page.tsx
print("=== Checking charges page.tsx on server ===")
out = run(f"grep -n 'assignToAll\\|ALL Customers\\|Assign to ALL' {REMOTE_BASE}/src/app/dashboard/\\(pages\\)/charges/page.tsx 2>/dev/null | head -10")
print(out or "NOT FOUND - file may not have been updated")

# Check chargeController.js 
print("\n=== Checking chargeController.js on server ===")
out = run(f"grep -n 'ALL_CUSTOMERS\\|targetCustomers\\|assignToAll' {REMOTE_BASE}/backend/controllers/chargeController.js 2>/dev/null | head -10")
print(out or "NOT FOUND")

# Check staffController.js
print("\n=== Checking staffController.js on server ===")
out = run(f"grep -n 'resolvedMerchantId\\|finalRoleId' {REMOTE_BASE}/backend/controllers/staffController.js 2>/dev/null | head -5")
print(out or "NOT FOUND")

# Check where the Next.js build output is served from
print("\n=== Checking .next build dir ===")
out = run(f"ls -la {REMOTE_BASE}/.next/server/app/dashboard/charges/ 2>/dev/null | head -10")
print(out or "No .next/server dir found")

# Check if there's a different frontend path
print("\n=== Checking frontend paths ===")
out = run("find /home/mayowae -name 'package.json' -not -path '*/node_modules/*' 2>/dev/null | head -10")
print(out)

client.close()
