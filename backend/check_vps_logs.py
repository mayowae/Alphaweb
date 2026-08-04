import paramiko

HOSTNAME = '159.198.36.24'
PORT = 22
USERNAME = 'root'
PASSWORD = 'yft1x2X89Z0MZrAvM9'

def get_logs():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOSTNAME, port=PORT, username=USERNAME, password=PASSWORD)
    stdin, stdout, stderr = client.exec_command("pm2 logs alphaweb-backend --err --lines 50 --nostream")
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    client.close()
    print("=== PM2 ERROR LOGS ===")
    print(out or err)

if __name__ == '__main__':
    get_logs()
