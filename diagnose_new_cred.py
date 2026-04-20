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

diag = {}

diag['bind_status'] = run("systemctl status named")[0] or run("systemctl status bind9")[0]
diag['nginx_conf'] = run("cat /etc/nginx/conf.d/alphaweb.conf")[0]
diag['named_conf'] = run("find /var/named /etc/bind -name '*alphakolect.com*' 2>/dev/null")[0]
diag['dig_local'] = run("dig alphakolect.com @127.0.0.1 +short")[0]
diag['dig_www_local'] = run("dig www.alphakolect.com @127.0.0.1 +short")[0]

client.close()

with open('new_server_diag.json', 'w', encoding='utf-8') as f:
    json.dump(diag, f, indent=2)

print("Diagnostics complete.")
