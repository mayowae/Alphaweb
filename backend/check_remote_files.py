import paramiko

HOSTNAME = '159.198.36.24'
PORT = 22
USERNAME = 'root'
PASSWORD = 'yft1x2X89Z0MZrAvM9'

def run_ssh_cmd(cmd):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOSTNAME, port=PORT, username=USERNAME, password=PASSWORD)
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    client.close()
    return out, err

print("=== Checking server.js on Remote VPS ===")
out, err = run_ssh_cmd("grep -n -C 2 -i 'subscription' /home/mayowae/public_html/alphaweb/backend/server.js")
print(out)

print("=== Checking merchantManagementController.js on Remote VPS ===")
out, err = run_ssh_cmd("grep -n 'getMySubscription\\|getMerchantSubscriptions' /home/mayowae/public_html/alphaweb/backend/controllers/merchantManagementController.js")
print(out)

print("=== Checking merchant.js Model on Remote VPS ===")
out, err = run_ssh_cmd("grep -n -i 'subscription\\|debt\\|plan' /home/mayowae/public_html/alphaweb/backend/models/merchant.js")
print(out)

print("=== Generating test token and curlling subscription endpoints ===")
cmd_token = "node -e \"const jwt = require('/home/mayowae/public_html/alphaweb/backend/node_modules/jsonwebtoken'); const token = jwt.sign({id:1,type:'merchant',email:'mayowae@msn.com'}, '9fA2KqLxP7D4RZcM8wE5NHyUeJbS6TQ0mV1aXoC3rIYFgWUp'); console.log(token);\""
token, err = run_ssh_cmd(cmd_token)
token = token.strip()
print(f"Token: {token[:30]}...")

out_url1, err1 = run_ssh_cmd(f"curl -s -w '\\nHTTP_CODE: %{{http_code}}\\n' http://127.0.0.1:5000/merchant/subscription -H 'Authorization: Bearer {token}'")
print("\n--- /merchant/subscription ---")
print(out_url1)

out_url2, err2 = run_ssh_cmd(f"curl -s -w '\\nHTTP_CODE: %{{http_code}}\\n' http://127.0.0.1:5000/api/merchant/subscription -H 'Authorization: Bearer {token}'")
print("\n--- /api/merchant/subscription ---")
print(out_url2)
