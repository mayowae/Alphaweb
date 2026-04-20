import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('build_check2.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

BASE = '/home/mayowae/public_html/alphaweb'

# Check if new build is still running
p("=== Build log (last 20 lines) ===")
out = run(f"tail -n 20 {BASE}/build_billing.log")
p(out)

p("\n=== Is build process running? ===")
out = run("ps aux | grep 'next build' | grep -v grep")
p(out if out.strip() else "No build process running")

p("\n=== PM2 frontend status ===")
out = run("pm2 show alphaweb-frontend | grep -E 'status|uptime|restarts'")
p(out)

log.close()
print("Done - see build_check2.txt")
client.close()
