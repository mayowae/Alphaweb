import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace'), stderr.read().decode('utf-8', errors='replace')

# Check the Merchant model associations for Plan and Agent
print("=== Merchant model associations ===")
out, err = run("grep -n 'Plan\\|Agent\\|belongsTo\\|hasMany\\|plan\\|agent' /home/mayowae/public_html/alphaweb/backend/models/merchant.js | head -40")
print(out)

# Check if db.Subscription model exists
print("=== db.Subscription model check ===")
out, err = run("ls /home/mayowae/public_html/alphaweb/backend/models/")
print(out)

# Check the full response by testing with a fresh login
print("=== Test login to get token ===")
out, err = run("""curl -s -X POST http://127.0.0.1:5000/merchant/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@test.com","password":"test123"}' | head -c 200""")
print(out)

client.close()
