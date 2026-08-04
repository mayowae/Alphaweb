import paramiko, sys, os

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'
PORT = 22

LOCAL_BASE = r'c:\Users\trade\Documents\Alphaweb-main'
REMOTE_BASE = '/home/mayowae/public_html/alphaweb'

FILES_TO_UPLOAD = [
    (
        os.path.join(LOCAL_BASE, 'src', 'app', 'dashboard', 'customer', '[id]', 'page.tsx'),
        f'{REMOTE_BASE}/src/app/dashboard/customer/[id]/page.tsx'
    ),
]

def connect():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOSTNAME, port=PORT, username=USERNAME, password=PASSWORD, timeout=30)
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
    sftp = client.open_sftp()

    print("\n=== Step 1: Uploading customer details page.tsx ===")
    for local, remote in FILES_TO_UPLOAD:
        print(f"  Uploading {os.path.basename(local)}...")
        sftp.put(local, remote)
        print("  OK")
    sftp.close()

    print("\n=== Step 2: Rebuilding frontend ===")
    rc = run(client, f"cd {REMOTE_BASE} && npm run build 2>&1 | tail -40", "npm run build")
    if rc != 0:
        print("Build FAILED!")
        client.close()
        sys.exit(1)

    print("\n=== Step 3: Restarting frontend ===")
    run(client, "pm2 restart alphaweb-frontend 2>&1 | cat", "Restart frontend")
    run(client, "pm2 save 2>&1 | cat", "pm2 save")

    client.close()
    print("\n=== ALL DONE! Deploy complete ===")
