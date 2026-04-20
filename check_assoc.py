import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('assoc_check.txt', 'w', encoding='utf-8')

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

def p(msg):
    log.write(str(msg) + '\n')
    log.flush()

p("=== models/index.js associations ===")
out = run("cat /home/mayowae/public_html/alphaweb/backend/models/index.js")
p(out)

p("\n=== subscription.js model ===")
out = run("cat /home/mayowae/public_html/alphaweb/backend/models/subscription.js")
p(out)

p("\n=== plan.js model ===")
out = run("cat /home/mayowae/public_html/alphaweb/backend/models/plan.js")
p(out)

log.close()
print("Done - see assoc_check.txt")
client.close()
