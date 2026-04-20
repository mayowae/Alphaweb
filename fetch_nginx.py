import paramiko
import json
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace')

output = run("cat /etc/nginx/conf.d/alphaweb.conf")
with open('nginx_conf.json', 'w', encoding='utf-8') as f:
    json.dump({'conf': output}, f, indent=2)

client.close()
