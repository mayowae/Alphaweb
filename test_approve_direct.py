import paramiko
import sys
sys.stdout.reconfigure(encoding='utf-8')

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(hostname, port=port, username=username, password=password)

# First get a valid token by logging in
print("=== Getting auth token ===")
stdin, stdout, stderr = ssh.exec_command(
    "curl -s -X POST http://localhost:5000/merchant/login "
    "-H 'Content-Type: application/json' "
    "-d '{\"email\":\"admin@alphakolect.com\",\"password\":\"Admin1234!\"}' 2>&1 | head -5"
)
print("Login attempt:", stdout.read().decode('utf-8', errors='ignore'))

# Get list of remittances to find a pending ID
print("\n=== List first 3 remittances ===")
stdin, stdout, stderr = ssh.exec_command(
    "TOKEN=$(curl -s -X POST http://localhost:5000/merchant/login "
    "-H 'Content-Type: application/json' "
    "-d '{\"email\":\"admin@alphakolect.com\",\"password\":\"Admin1234!\"}' | python3 -c \"import sys,json; d=json.load(sys.stdin); print(d.get('token',''))\" 2>/dev/null); "
    "echo \"Token: ${TOKEN:0:30}...\"; "
    "curl -s -H \"Authorization: Bearer $TOKEN\" http://localhost:5000/remittances 2>&1 | python3 -c \"import sys,json; d=json.load(sys.stdin); [print(r['id'], r['status'], r['amount']) for r in d.get('remittances',[])[:5]]\" 2>/dev/null"
)
out = stdout.read().decode('utf-8', errors='ignore')
print(out or "(no output)")

print("\n=== Try to approve first pending remittance ===")
stdin, stdout, stderr = ssh.exec_command(
    "TOKEN=$(curl -s -X POST http://localhost:5000/merchant/login "
    "-H 'Content-Type: application/json' "
    "-d '{\"email\":\"admin@alphakolect.com\",\"password\":\"Admin1234!\"}' | python3 -c \"import sys,json; d=json.load(sys.stdin); print(d.get('token',''))\" 2>/dev/null); "
    "REMIT_ID=$(curl -s -H \"Authorization: Bearer $TOKEN\" http://localhost:5000/remittances | python3 -c \"import sys,json; r=[x for x in json.load(sys.stdin).get('remittances',[]) if x['status']=='Pending']; print(r[0]['id'] if r else 'none')\" 2>/dev/null); "
    "echo \"Approving remittance ID: $REMIT_ID\"; "
    "curl -s -X PUT -H \"Authorization: Bearer $TOKEN\" http://localhost:5000/remittances/$REMIT_ID/approve 2>&1"
)
print(stdout.read().decode('utf-8', errors='ignore') or "(no output)")

ssh.close()
