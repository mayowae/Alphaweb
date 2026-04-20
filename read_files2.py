import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('read_files2.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

BASE = '/home/mayowae/public_html/alphaweb'

# Find the api services file
p("=== Find services/api file ===")
out = run(f"find {BASE}/src -name 'api.ts' -o -name 'api.js' | head -10")
p(out)

out = run(f"find {BASE}/src -name '*.ts' | xargs grep -l 'getMerchantSubscription' 2>/dev/null")
p(out)

# Read Subscriptions&Billings tab component
p("\n=== Subscriptions&Billings tab component ===")
out = run(f"cat '{BASE}/src/components/tables/merchants/merchantdetailstabs/Subscriptions&Billings.tsx' 2>/dev/null | head -100")
p(out if out.strip() else "File not found")

# List all files in merchantdetailstabs
p("\n=== merchantdetailstabs files ===")
out = run(f"ls '{BASE}/src/components/tables/merchants/merchantdetailstabs/'")
p(out)

# Read agent controller create function
p("\n=== Agent create in agentController (lines 225-275) ===")
out = run(f"sed -n '225,280p' {BASE}/backend/controllers/agentController.js")
p(out)

# Find adminAPI utility
p("\n=== adminApi.ts functions ===")
out = run(f"grep -n 'getMerchant\\|updateMerchant\\|subscription\\|customFee\\|isCustom' {BASE}/src/app/admin/dashboard/utilis/adminApi.ts | head -30")
p(out)

log.close()
print("Done - see read_files2.txt")
client.close()
