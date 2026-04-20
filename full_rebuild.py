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

# 1. Build the frontend
print("--- rebuilding frontend ---")
o, e = run("cd /home/mayowae/public_html/alphaweb && npm run build")
print("OUT:", o)
print("ERR:", e)

# 2. Restart the frontend process
# Assume the command was 'next start' or similar. 
# Better: use 'pm2 restart' if it's there? I didn't see it for FE.
# I'll try to find the PID and kill it, then restart.
pid_out, _ = run("netstat -tulpn | grep :3000 | awk '{print $7}' | cut -d/ -f1")
pid = pid_out.strip()
if pid:
    print(f"--- killing PID {pid} ---")
    run(f"kill -9 {pid}")
    
print("--- starting frontend in background ---")
# I'll use PM2 to make it robust if possible
run("cd /home/mayowae/public_html/alphaweb && pm2 start 'npm start' --name alphaweb-frontend")

client.close()
