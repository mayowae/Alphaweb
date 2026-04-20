import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('read_files4.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

BASE = '/home/mayowae/public_html/alphaweb'

# Read adminApi.ts
p("=== adminApi.ts (lines 160-220) ===")
out = run(f"sed -n '160,220p' {BASE}/src/app/admin/utilis/adminApi.ts")
p(out)

# Find @/services/api
p("\n=== Find @/services/api ===")
out = run(f"find {BASE}/src -path '*services/api*' 2>/dev/null")
p(out)
# Check tsconfig for path aliases
out = run(f"grep -n 'services\\|@/' {BASE}/tsconfig.json 2>/dev/null | head -10")
p("tsconfig paths: " + out)
# Search all JS/TS files for getMerchantSubscription definition
out = run(f"grep -rn 'export.*getMerchantSubscription\\|getMerchantSubscription.*=' {BASE}/src/ 2>/dev/null | head -10")
p("Function definition: " + out)

# merchantdetailstabs - find what Subscriptions_Billings imports
p("\n=== Find Subscriptions_Billings component ===")
out = run(f"find {BASE}/src -name '*Subscriptions*' -o -name '*sub*billing*' 2>/dev/null | head -5")
p(out)
out = run(f"grep -rn 'Subscriptions_Billings\\|SubscriptionsBillings' {BASE}/src/ --include='*.tsx' -l 2>/dev/null")
p(out)

# Read the merchantsdetails import path to find Subscriptions&Billings
out = run(f"grep 'Subscriptions' '{BASE}/src/app/admin/dashboard/(pages)/merchants/[id]/merchantsdetails.tsx'")
p("Import path: " + out)

log.close()
print("Done - see read_files4.txt")
client.close()
