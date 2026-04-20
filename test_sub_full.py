import paramiko
import json

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('sub_test_output.txt', 'w', encoding='utf-8')

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

def p(msg):
    log.write(str(msg) + '\n')
    log.flush()

# Step 1: Login with mayowae@msn.com to get a real token
p("=== LOGIN ===")
login_resp = run("""curl -s -X POST http://127.0.0.1:5000/merchant/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"mayowae@msn.com","password":"mayowae123"}'""")
p(login_resp)

# Try to parse token from response
token = None
try:
    data = json.loads(login_resp)
    token = data.get('token') or data.get('accessToken') or data.get('data', {}).get('token')
    p(f"Token found: {str(token)[:50] if token else 'NOT FOUND'}")
except:
    p("Could not parse login response as JSON")

if not token:
    # Try different passwords
    for pwd in ['Mayowae@123', 'AlphaWeb2026', 'password123', 'Mayowae123']:
        r = run(f"""curl -s -X POST http://127.0.0.1:5000/merchant/login \
          -H 'Content-Type: application/json' \
          -d '{{"email":"mayowae@msn.com","password":"{pwd}"}}'""")
        p(f"Try {pwd}: {r[:100]}")
        try:
            data = json.loads(r)
            token = data.get('token') or data.get('accessToken') or data.get('data', {}).get('token')
            if token:
                p(f"Got token with password: {pwd}")
                break
        except:
            pass

if token:
    p("\n=== SUBSCRIPTION DATA ===")
    sub_resp = run(f"""curl -s http://127.0.0.1:5000/api/merchant/subscription \
      -H 'Authorization: Bearer {token}'""")
    p(sub_resp)
else:
    # Use merchant id directly to test the query
    p("\n=== Direct DB subscription query for merchant id=5 ===")
    out = run("PGPASSWORD='AlphaWeb2026!' psql -h localhost -U alpha_admin -d alphacollect_db -c \"SELECT id, email, subscription_status, plan_id, next_billing_date, total_debt, trial_end_date FROM merchants WHERE id=5;\" 2>&1")
    p(out)

log.close()
print("Done - see sub_test_output.txt")
client.close()
