import paramiko
import json

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('final_test.txt', 'w', encoding='utf-8')

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

def p(msg):
    log.write(str(msg) + '\n')
    log.flush()

# The backend logs show merchant id=5 (mayowae@msn.com) is actively making requests
# Let's generate a test token using the JWT secret and test the subscription endpoint
import_check = run("node -e \"const jwt = require('/home/mayowae/public_html/alphaweb/backend/node_modules/jsonwebtoken'); const token = jwt.sign({id:5,type:'merchant',email:'mayowae@msn.com'}, '9fA2KqLxP7D4RZcM8wE5NHyUeJbS6TQ0mV1aXoC3rIYFgWUp'); console.log(token);\"")
test_token = import_check.strip()
p("Generated test token: " + test_token[:60] + "...")

p("\n=== Full subscription API response ===")
out = run(f"curl -s http://127.0.0.1:5000/api/merchant/subscription -H 'Authorization: Bearer {test_token}'")
p(out)

# Also check backend error log for any new errors since restart
p("\n=== Backend error log (errors after restart only) ===")
out = run("wc -l /home/mayowae/public_html/alphaweb/logs/backend-error-0.log")
p("Error log lines: " + out)
out = run("tail -n 5 /home/mayowae/public_html/alphaweb/logs/backend-error-0.log")
p("Last 5 lines of error log:\n" + out)

log.close()
print("Done - see final_test.txt")
client.close()
