import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace'), stderr.read().decode('utf-8', errors='replace')

print("--- killing everything on 3000 ---")
run("fuser -k 3000/tcp || true")
run("pm2 delete alphaweb-frontend || true")

print("--- starting frontend in background with PM2 ---")
# On VPS, starting npm start via pm2 might need full path to npm or using 'npm -- start'
run("cd /home/mayowae/public_html/alphaweb && pm2 start 'npm start' --name alphaweb-frontend")

print("--- check if it's running ---")
import time
time.sleep(10)
print(run("netstat -tulpn | grep :3000"))

client.close()
