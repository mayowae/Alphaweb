import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('restart_output.txt', 'w', encoding='utf-8')

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

def p(msg):
    log.write(str(msg) + '\n')
    log.flush()

# Kill any process on 3000 then restart PM2 frontend
run("fuser -k 3000/tcp")
time.sleep(2)
run("pm2 restart alphaweb-frontend")
p("Frontend restarted.")
time.sleep(5)

# Check it's up
out = run("netstat -tunlp | grep 3000")
p("Port 3000 status:\n" + out)

out = run("curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/dashboard/subscription")
p("HTTP status of /dashboard/subscription: " + out)

log.close()
print("Done - see restart_output.txt")
client.close()
