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
echo "=PORTS_APACHE="
ss -tulpn | grep ':808'

echo ""
echo "=PORT_8083_8084_TEST="
curl -sk -o /dev/null -w "8083 HTTP: %{http_code}" http://127.0.0.1:8083/ -H "Host: paxalphaltd.com" 2>/dev/null
echo ""
curl -sk -o /dev/null -w "8084 HTTPS: %{http_code}" https://127.0.0.1:8084/ -H "Host: paxalphaltd.com" 2>/dev/null
echo ""

echo ""
echo "=NGINX_ERROR_LOG_LAST50="
tail -50 /var/log/nginx/error.log 2>/dev/null || \
tail -50 /usr/local/emps/var/log/nginx_error.log 2>/dev/null || \
find /var/log -name '*nginx*error*' 2>/dev/null | head -3 | xargs tail -20 2>/dev/null

echo ""
echo "=PAXALPHA_CONF="
cat /etc/nginx/conf.d/paxalphaltd.com.conf

echo ""
echo "=WEBUZO_PROXY_CONF="
cat /usr/local/apps/nginx/etc/conf.d/proxy.conf 2>/dev/null

echo ""
echo "=APACHE_STATUS="
systemctl status httpd 2>/dev/null || systemctl status apache2 2>/dev/null || \
ps aux | grep httpd | grep -v grep | head -5

echo ""
echo "=CURL_PAXALPHA_HTTP="
curl -v http://127.0.0.1:8083/ -H "Host: paxalphaltd.com" 2>&1 | head -30

echo ""
echo "=CURL_PAXALPHA_HTTPS="
curl -vsk https://127.0.0.1:8084/ -H "Host: paxalphaltd.com" 2>&1 | head -40
""", timeout=60)

print(result)
with open(r"C:\Users\trade\Documents\Alphaweb-main\debug_502.txt", "w", encoding="utf-8") as f:
    f.write(result)
ssh.close()
print("\nSaved to debug_502.txt")
