import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('audit_billing2.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

BASE = '/home/mayowae/public_html/alphaweb'

# Admin merchant [id] page
p("=== Admin merchant detail page files ===")
out = run(f"find {BASE}/src/app/admin -name '*.tsx' | head -20")
p(out)

out = run(f"ls {BASE}/src/app/admin/dashboard/merchants/")
p("Admin merchants dir: " + out)

# Dashboard layout - where to add subscription gate
p("\n=== Dashboard layout ===")
out = run(f"cat {BASE}/src/app/dashboard/layout.tsx 2>/dev/null || find {BASE}/src -name 'layout.tsx' | grep dashboard | head -5")
p(out)

# merchantManagementController.updateMerchant - what it updates
p("\n=== updateMerchant function ===")
out = run(f"sed -n '1,50p' {BASE}/backend/controllers/merchantManagementController.js")
p(out)

# Check if updateMerchant handles planId / is_custom_fee
p("\n=== Full updateMerchant + getSubs ===")
out = run(f"grep -n -A 40 'updateMerchant' {BASE}/backend/controllers/merchantManagementController.js | head -60")
p(out)

log.close()
print("Done - see audit_billing2.txt")
client.close()
