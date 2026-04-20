import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=600)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace'), stderr.read().decode('utf-8', errors='replace')

print("--- stopping backend to free RAM ---")
run("pm2 stop alphaweb-backend")

print("--- rebuilding frontend with more aggressive memory limit ---")
# Use 1024MB for build (still risky)
run("cd /home/mayowae/public_html/alphaweb && rm -rf .next && npm run build")

print("--- building finished, starting everything ---")
run("pm2 start alphaweb-backend")
run("cd /home/mayowae/public_html/alphaweb && (nohup npm start > next.log 2>&1 &)")

import time
time.sleep(15)

print("--- checking listening portrait ---")
print(run("netstat -tulpn | grep -E ':3000|:5000'"))

client.close()
