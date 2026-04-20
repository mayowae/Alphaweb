import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('restart_verify.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

BASE = '/home/mayowae/public_html/alphaweb'

# Hard restart the backend (stop + start to clear crash loop)
p("=== Backend hard restart ===")
run("pm2 stop alphaweb-backend")
time.sleep(3)
run("pm2 start alphaweb-backend")
time.sleep(8)

# Verify it stayed up
out = run("pm2 show alphaweb-backend | grep -E 'status|restarts|uptime'")
p(out)

# Test backend responds
out = run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:5000/health")
p(f"Backend /health: {out}")

# Test subscription endpoint (no token = should get 401, not 000)
out = run("curl -s http://127.0.0.1:5000/api/merchant/subscription")
p(f"Subscription endpoint: {out}")

# Generate token and test full response
test_token = run("node -e \"const jwt=require('/home/mayowae/public_html/alphaweb/backend/node_modules/jsonwebtoken');console.log(jwt.sign({id:5,type:'merchant',email:'mayowae@msn.com'},'9fA2KqLxP7D4RZcM8wE5NHyUeJbS6TQ0mV1aXoC3rIYFgWUp'))\"").strip()
out = run(f"curl -s http://127.0.0.1:5000/api/merchant/subscription -H 'Authorization: Bearer {test_token}'")
p(f"\nFull subscription response:\n{out[:500]}")

# Also check backend error log for any new errors
p("\n=== Backend error log (last 5 lines) ===")
out = run(f"tail -n 5 {BASE}/logs/backend-error-0.log")
p(out)

# Port 3000 and 5000 both live?
p("\n=== Both ports live ===")
out = run("netstat -tunlp | grep -E ':3000|:5000'")
p(out)

log.close()
print("Done - see restart_verify.txt")
client.close()
