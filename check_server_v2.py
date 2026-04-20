import paramiko
import json

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

res = {}
res['netstat'] = run("netstat -tunlp")[0]
res['curl_https'] = run("curl -k -I -H 'Host: alphakolect.com' https://127.0.0.1")[0]
res['pm2_logs_backend'] = run("pm2 logs alphaweb-backend --lines 50 --no-daemon")[0]
res['pm2_logs_frontend'] = run("pm2 logs alphaweb-frontend --lines 50 --no-daemon")[0]

with open('server_detail_2.json', 'w', encoding='utf-8') as f:
    json.dump(res, f, indent=2)

client.close()
print("Done")
