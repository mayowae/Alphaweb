import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('read_files3.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

BASE = '/home/mayowae/public_html/alphaweb'

# Find all adminApi files
p("=== Find adminApi ===")
out = run(f"find {BASE}/src -name 'adminApi*' 2>/dev/null")
p(out)

# Find merchantdetailstabs
p("\n=== Find merchantdetailstabs ===")
out = run(f"find {BASE}/src -name '*Subscription*' -o -name '*Billing*' 2>/dev/null | head -10")
p(out)

# Read the adminAPI being used in merchantsdetails.tsx
p("\n=== adminAPI import in merchantsdetails.tsx ===")
out = run(f"cat {BASE}/src/app/admin/dashboard/utilis/adminApi.ts 2>/dev/null | head -80")
p(out)

# Check the actual path
out = run(f"find {BASE}/src -name 'adminApi*' -o -name 'admin-api*' 2>/dev/null")
p("All admin api files: " + out)

# Find services directory
p("\n=== Services directory ===")
out = run(f"find {BASE}/src -name 'services' -type d 2>/dev/null")
p(out)
out = run(f"find {BASE}/src -name 'api*' | head -10")
p(out)

# getMerchantSubscription 
p("\n=== getMerchantSubscription ===")
out = run(f"grep -rn 'getMerchantSubscription' {BASE}/src/ 2>/dev/null | head -10")
p(out)

log.close()
print("Done - see read_files3.txt")
client.close()
