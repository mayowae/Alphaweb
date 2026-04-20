import paramiko
import json

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '16ZWg2GbG4jd2rMkV4'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

res = {}
res['dig'] = run("dig alphakolect.com +short")[0]
res['nslookup'] = run("nslookup alphakolect.com")[0]
res['ping'] = run("ping -c 1 alphakolect.com")[0]

with open('dns_check.json', 'w', encoding='utf-8') as f:
    json.dump(res, f, indent=2)

client.close()
print("Done")
