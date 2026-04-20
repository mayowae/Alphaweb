import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('read_files.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

BASE = '/home/mayowae/public_html/alphaweb'

# Admin merchant detail - full file
p("=== Admin merchantsdetails.tsx ===")
out = run(f"cat '{BASE}/src/app/admin/dashboard/(pages)/merchants/[id]/merchantsdetails.tsx'")
p(out)

# Agent controller - look for create agent route to hook plan recalculation
p("\n=== Agent create in authController or agentController ===")
out = run(f"grep -rn 'agent.*create\\|createAgent\\|addAgent\\|Agent.create' {BASE}/backend/controllers/ | head -20")
p(out)

# services/api.ts - getMerchantSubscription function
p("\n=== getMerchantSubscription in services/api ===")
out = run(f"grep -n 'getMerchantSubscription\\|subscription' {BASE}/src/services/api.ts | head -20")
p(out)

log.close()
print("Done - see read_files.txt")
client.close()
