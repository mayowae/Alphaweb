import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('page_check.txt', 'w', encoding='utf-8')

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

def p(msg):
    log.write(str(msg) + '\n')
    log.flush()

# Check the subscription page.tsx on server
p("=== Subscription page.tsx on server ===")
out = run("cat '/home/mayowae/public_html/alphaweb/src/app/dashboard/(pages)/subscription/page.tsx'")
p(out)

# Check what token key is used in other pages for comparison
p("\n=== Token key used in other dashboard pages ===")
out = run("grep -r 'localStorage.getItem' /home/mayowae/public_html/alphaweb/src/app/dashboard --include='*.tsx' -l")
p(out)

out = run("grep -r 'localStorage.getItem' /home/mayowae/public_html/alphaweb/src/app/dashboard --include='*.tsx' | head -20")
p(out)

log.close()
print("Done - see page_check.txt")
client.close()
