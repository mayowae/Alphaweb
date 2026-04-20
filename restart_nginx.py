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
res['restart_out'], res['restart_err'] = run("systemctl restart nginx")
res['status_out'], res['status_err'] = run("systemctl status nginx")

with open('restart_results.json', 'w', encoding='utf-8') as f:
    json.dump(res, f, indent=2)

client.close()
print("Restarting complete.")
