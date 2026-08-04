"""
Just restart backend and rebuild frontend — files already uploaded.
"""
import paramiko, sys

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'
REMOTE_BASE = '/home/mayowae/public_html/alphaweb'

def connect():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOSTNAME, port=22, username=USERNAME, password=PASSWORD, timeout=30)
    print("Connected OK")
    return client

def run(client, cmd, desc=''):
    print(f"\n>>> {desc or cmd[:80]}")
    _, stdout, stderr = client.exec_command(cmd, timeout=300)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    rc = stdout.channel.recv_exit_status()
    safe = lambda s: s.encode('ascii', errors='replace').decode('ascii')
    if out: print(safe(out)[-3000:])
    if err and rc != 0: print("STDERR:", safe(err)[-500:])
    return rc

if __name__ == '__main__':
    client = connect()

    print("\n=== Step 1: Restart backend ===")
    rc = run(client, "pm2 restart alphaweb-backend 2>&1 | cat", "Restart backend")
    if rc != 0:
        run(client, f"pm2 start {REMOTE_BASE}/backend/server.js --name alphaweb-backend 2>&1 | cat")

    print("\n=== Step 2: Rebuild frontend ===")
    rc = run(client, f"cd {REMOTE_BASE} && npm run build 2>&1 | tail -40", "npm run build")
    if rc != 0:
        print("Build FAILED!")
        client.close()
        sys.exit(1)

    print("\n=== Step 3: Save PM2 ===")
    run(client, "pm2 save 2>&1 | cat", "pm2 save")

    client.close()
    print("\n=== ALL DONE! Deploy complete ===")
