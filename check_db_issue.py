import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8'), stderr.read().decode('utf-8')

print("--- Searching Backend Errors ---")
out, err = run("grep -C 5 'Connection terminated unexpectedly' /root/.pm2/logs/alphaweb-backend-error.log | tail -n 50")
print(out)

print("--- Checking models/index.js ---")
out, err = run("cat /home/mayowae/public_html/alphaweb/backend/models/index.js")
print(out)

print("--- Checking server.js ---")
out, err = run("cat /home/mayowae/public_html/alphaweb/backend/server.js")
print(out)

client.close()
