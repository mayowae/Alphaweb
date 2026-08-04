import paramiko, sys

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOSTNAME, port=22, username=USERNAME, password=PASSWORD, timeout=30)
print("Connected")

def run(cmd):
    _, stdout, stderr = client.exec_command(cmd, timeout=30)
    out = stdout.read().decode()
    err = stderr.read().decode()
    if out: print(out)
    if err: print("ERR:", err)

run("find / -name 'chargeController.js' 2>/dev/null | grep -v node_modules | head -10")
run("find / -name 'server.js' -path '*/backend/*' 2>/dev/null | grep -v node_modules | head -10")
run("ls /var/www/ 2>/dev/null || echo 'no /var/www'")
run("ls /root/ 2>/dev/null")
run("pm2 list 2>/dev/null | head -20")

client.close()
