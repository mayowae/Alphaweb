import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

hostname = '159.198.36.24'
password = '96eUC4aTbMu1o3yAP2'
FRONTEND_PATH = '/home/mayowae/public_html/alphaweb'
BUILD_LOG = '/tmp/alphaweb_build.log'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect(hostname, port=22, username='root', password=password, timeout=10)
    print("Connected")

    # 1. Upload files
    files_to_sync = [
        (r'src\app\dashboard\customer\[id]\page.tsx', f'{FRONTEND_PATH}/src/app/dashboard/customer/[id]/page.tsx'),
        (r'src\app\dashboard\(pages)\wallet\page.tsx', f'{FRONTEND_PATH}/src/app/dashboard/(pages)/wallet/page.tsx')
    ]
    
    sftp = client.open_sftp()
    for local, remote in files_to_sync:
        print(f"Uploading {local}...")
        sftp.put(local, remote)
    sftp.close()
    print("Files uploaded")

    def run(cmd, timeout=600):
        stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
        rc = stdout.channel.recv_exit_status()
        out = stdout.read().decode('utf-8', errors='replace')
        err = stderr.read().decode('utf-8', errors='replace')
        return rc, out, err

    # 2. Run build
    print("Running build (this takes ~2 minutes)...")
    rc, out, err = run(
        f"cd {FRONTEND_PATH} && npm run build > {BUILD_LOG} 2>&1",
        timeout=600
    )
    print(f"Build exit code: {rc}")

    # 3. Read log
    _, log, _ = run(f"tail -n 60 {BUILD_LOG}")
    print("\n=== BUILD LOG (last 60 lines) ===")
    print(log)

    if rc == 0:
        print("Build succeeded! Restarting frontend...")
        run("pm2 restart alphaweb-frontend")
        _, status, _ = run("pm2 jlist | python3 -c \"import sys,json; p=[x for x in json.load(sys.stdin) if x['name']=='alphaweb-frontend'][0]; print('status:', p['pm2_env']['status'])\"")
        print(status)
    else:
        print("Build FAILED. See log above.")

    client.close()
except Exception as e:
    print(f"Failed: {e}")
