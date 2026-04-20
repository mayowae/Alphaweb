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

conf, err = run("cat /etc/nginx/conf.d/alphaweb.conf")
nginx_test, nginx_test_err = run("nginx -t")
curl_out, curl_err = run("curl -I -H 'Host: alphakolect.com' http://127.0.0.1")

res = {
    "conf": conf,
    "conf_err": err,
    "nginx_test": nginx_test,
    "nginx_test_err": nginx_test_err,
    "curl_out": curl_out,
    "curl_err": curl_err
}

with open('nginx_check.json', 'w', encoding='utf-8') as f:
    json.dump(res, f, indent=2)

client.close()
print("Done")
