import paramiko
import sys

sys.stdout.reconfigure(encoding='utf-8')

def deploy():
    hostname = '159.198.36.24'
    port = 22
    username = 'root'
    password = '96eUC4aTbMu1o3yAP2'

    local_root = r'C:\Users\trade\Documents\Alphaweb-main'
    remote_root = '/home/mayowae/public_html/alphaweb'

    files_to_upload = [
        r'src\app\dashboard\(pages)\collection\(pages)\collections\page.tsx',
        r'src\components\SingleCollectionForm.tsx',
        r'src\components\BulkCollectionForm.tsx',
    ]

    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port=port, username=username, password=password)
    sftp = ssh.open_sftp()

    for rel_path in files_to_upload:
        local_path = local_root + '\\' + rel_path
        remote_path = remote_root + '/' + rel_path.replace('\\', '/')
        print(f"Uploading {rel_path}...")
        sftp.put(local_path, remote_path)

    sftp.close()

    print("Starting build...")
    stdin, stdout, stderr = ssh.exec_command(
        f"cd {remote_root} && export NODE_OPTIONS=--max-old-space-size=4096 && npm run build"
    )
    exit_status = stdout.channel.recv_exit_status()

    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')

    with open('collections_build.log', 'w', encoding='utf-8') as f:
        f.write(out + '\n' + err)

    if exit_status == 0:
        print("Build succeeded! Restarting frontend...")
        ssh.exec_command(f"cd {remote_root} && pm2 restart alphaweb-frontend || pm2 start npm --name 'alphaweb-frontend' -- start")
        ssh.exec_command(f"pm2 restart next || true")
        print("Deployment complete!")
    else:
        print("Build failed. Check collections_build.log for details.")

    ssh.close()

if __name__ == "__main__":
    deploy()
