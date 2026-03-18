import paramiko

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"

def run(ssh, cmd, timeout=30):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    stdout.channel.recv_exit_status()
    o = stdout.read().decode("utf-8", errors="replace").strip()
    e = stderr.read().decode("utf-8", errors="replace").strip()
    return (o + ("\n" + e if e else "")).strip()

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, 22, SSH_USER, SSH_PASS, timeout=10, allow_agent=False, look_for_keys=False)

result = run(ssh, r"""
echo "=APACHE_PORT_8081_HTTP_TEST="
curl -v --max-time 5 -H "Host: bhislass.com" http://127.0.0.1:8081/ 2>&1 | grep -E 'Location|< HTTP|Connected|refused|Response'

echo ""
echo "=APACHE_PORT_8082_HTTP_TEST="
curl -v --max-time 5 -H "Host: bhislass.com" http://127.0.0.1:8082/ 2>&1 | grep -E 'Location|< HTTP|Connected|refused|Response'

echo ""
echo "=APACHE_PORT_8082_HTTPS_TEST="
curl -vsk --max-time 5 -H "Host: bhislass.com" https://127.0.0.1:8082/ 2>&1 | grep -E 'Location|< HTTP|Connected|refused|Response|SSL'

echo ""
echo "=APACHE_HTTPD_CONF_PORTS="
grep -rn "Listen\|VirtualHost\|ServerName" /usr/local/apps/apache2/etc/httpd.conf 2>/dev/null | head -30

echo ""
echo "=APACHE_VHOST_FILES="
find /usr/local/apps/apache2/etc -name '*.conf' 2>/dev/null | head -20

echo ""
echo "=APACHE_VH_CONF_HTTPD="
find /usr/local/apps/apache2/etc -name 'webuzoVH.conf' 2>/dev/null | xargs head -60 2>/dev/null

echo ""
echo "=BHISLASS_VHOST_IN_APACHE="
grep -rn "bhislass\|ServerName" /usr/local/apps/apache2/etc/ 2>/dev/null | head -20
""", timeout=60)

print(result)
with open(r"C:\Users\trade\Documents\Alphaweb-main\apache_diag.txt", "w", encoding="utf-8") as f:
    f.write(result)
ssh.close()
print("\nSaved to apache_diag.txt")
