import paramiko

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOSTNAME, port=22, username=USERNAME, password=PASSWORD, timeout=30)
print("Connected")

def run(cmd, desc=''):
    print(f"\n>>> {desc or cmd}")
    _, stdout, stderr = client.exec_command(cmd, timeout=60)
    out = stdout.read().decode('utf-8', errors='replace').encode('ascii', errors='replace').decode('ascii')
    err = stderr.read().decode('utf-8', errors='replace').encode('ascii', errors='replace').decode('ascii')
    rc = stdout.channel.recv_exit_status()
    if out: print(out)
    if err: print("ERR:", err)
    return rc

# Restart the frontend process so it picks up the new .next build
run("pm2 restart alphaweb-frontend 2>&1 | cat", "Restart frontend")
run("pm2 list 2>&1 | cat", "PM2 list")

client.close()
print("\nDone!")
