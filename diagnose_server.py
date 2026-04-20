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

diag = {}

diag['nginx_status'] = run("systemctl status nginx")[0]
diag['apache_status'] = run("systemctl status apache2")[0]
diag['pm2_list'] = run("pm2 list")[0]
diag['nginx_configs'] = run("grep -r 'alphakolect.com' /etc/nginx/")[0]
diag['apache_configs'] = run("grep -r 'alphakolect.com' /etc/apache2/")[0]
diag['hosts'] = run("cat /etc/hosts")[0]
diag['public_html'] = run("ls -l /home/mayowae/public_html/")[0]

client.close()

with open('server_diag.json', 'w') as f:
    json.dump(diag, f, indent=2)

print("Diagnostics complete. Results in server_diag.json")
