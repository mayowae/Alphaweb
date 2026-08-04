"""
Deploy bulk-assign charges + staff-fix changes to the VPS.
"""
import paramiko, sys, os

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'
PORT = 22

LOCAL_BASE = r'c:\Users\trade\Documents\Alphaweb-main'
REMOTE_BASE = '/home/mayowae/public_html/alphaweb'

FILES_TO_UPLOAD = [
    (
        os.path.join(LOCAL_BASE, 'backend', 'controllers', 'chargeController.js'),
        f'{REMOTE_BASE}/backend/controllers/chargeController.js'
    ),
    (
        os.path.join(LOCAL_BASE, 'backend', 'controllers', 'staffController.js'),
        f'{REMOTE_BASE}/backend/controllers/staffController.js'
    ),
    (
        os.path.join(LOCAL_BASE, 'src', 'app', 'dashboard', '(pages)', 'charges', 'page.tsx'),
        f'{REMOTE_BASE}/src/app/dashboard/(pages)/charges/page.tsx'
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
    # Strip non-cp1252 chars for Windows console
    safe_out = out.encode('ascii', errors='replace').decode('ascii')
    safe_err = err.encode('ascii', errors='replace').decode('ascii')
    if safe_out: print(safe_out[-3000:])
    if safe_err and rc != 0: print("STDERR:", safe_err[-500:])
    return rc

if __name__ == '__main__':
    client = connect()
    sftp = client.open_sftp()

    print("\n=== Step 1: Uploading files ===")
    for local, remote in FILES_TO_UPLOAD:
        print(f"  Uploading {os.path.basename(local)}...")
        sftp.put(local, remote)
        print("  OK")
    sftp.close()

    print("\n=== Step 2: Restarting backend ===")
    rc = run(client, "pm2 restart alphaweb-backend && echo 'Backend restarted OK'", "Restart backend")
    if rc != 0:
        run(client, f"pm2 start {REMOTE_BASE}/backend/server.js --name alphaweb-backend", "Start backend")

    print("\n=== Step 3: Rebuilding frontend ===")
    rc = run(client, f"cd {REMOTE_BASE} && npm run build 2>&1 | tail -30", "npm run build")
    if rc != 0:
        print("Build failed!")
        client.close()
        sys.exit(1)

    print("\n=== Step 4: Save PM2 ===")
    run(client, "pm2 save", "pm2 save")

    client.close()
    print("\n=== Deploy complete! ===")
