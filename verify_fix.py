import paramiko
import time
import sys

# Write all output to file to avoid terminal encoding issues
log = open('verify_output.txt', 'w', encoding='utf-8')

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    o = stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
    return o

def p(msg):
    log.write(msg + '\n')
    log.flush()

# Step 1: Check timestamp of last error in log vs backend restart time
p("=== Last backend error timestamp ===")
out = run("grep -o '2026-[^ ]*' /home/mayowae/public_html/alphaweb/logs/backend-error-0.log | tail -5")
p(out)

# Step 2: Test login with a real account (test@merchant.com)
p("\n=== Test login with real account ===")
out = run("""curl -s -X POST http://127.0.0.1:5000/merchant/login -H 'Content-Type: application/json' -d '{\"email\":\"test@merchant.com\",\"password\":\"Test1234\"}'""")
p(out[:500])

# Step 3: Test subscription endpoint (should get 401 without a token - confirming route works)
p("\n=== Subscription endpoint without token ===")
out = run("curl -s http://127.0.0.1:5000/api/merchant/subscription")
p(out)

# Step 4: Backend out log tail
p("\n=== Backend out log tail ===")
out = run("tail -n 20 /home/mayowae/public_html/alphaweb/logs/backend-out-0.log")
p(out)

log.close()
print('Done - see verify_output.txt')

client.close()
