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
res['netstat'] = run("netstat -tunlp | grep -E ':3000|:5000'")[0]
res['curl_internal_3000'] = run("curl -I http://127.0.0.1:3000")[0]
res['curl_internal_5000'] = run("curl -I http://127.0.0.1:5000")[0]
res['pm2_logs_backend_file'] = run("pm2 show alphaweb-backend | grep -i 'out log'")[0]
res['pm2_err_backend_file'] = run("pm2 show alphaweb-backend | grep -i 'error log'")[0]
res['pm2_logs_frontend_file'] = run("pm2 show alphaweb-frontend | grep -i 'out log'")[0]
res['pm2_err_frontend_file'] = run("pm2 show alphaweb-frontend | grep -i 'error log'")[0]

# Now read the last 100 lines of each if possible
# Or just get the tail directly
res['backend_err_tail'] = run("tail -n 100 `pm2 show alphaweb-backend | grep -i 'error log' | awk '{print $4}'`")[0]
res['frontend_err_tail'] = run("tail -n 100 `pm2 show alphaweb-frontend | grep -i 'error log' | awk '{print $4}'`")[0]

with open('server_detail_3.json', 'w', encoding='utf-8') as f:
    json.dump(res, f, indent=2)

client.close()
print("Done")
