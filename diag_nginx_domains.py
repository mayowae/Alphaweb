import paramiko

host = "159.198.36.24"
port = 22
username = "root"
password = "u4qwFxy62BYxR8O61X"

def run(ssh, cmd):
    stdin, stdout, stderr = ssh.exec_command(cmd)
    stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return (out + "\n" + err).strip()

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, port, username, password)

script = r"""
{
echo "=PORT_80_PROCESS="
ss -tulpn | grep ':80 '

echo ""
echo "=ALL_NGINX_SITES_ENABLED="
ls -la /etc/nginx/sites-enabled/ 2>/dev/null

echo ""
echo "=NGINX_CONF_D="
ls -la /etc/nginx/conf.d/ 2>/dev/null

echo ""
echo "=NGINX_TEST="
nginx -t 2>&1

echo ""
echo "=ALL_SERVER_NAME_ENTRIES="
grep -rn "server_name" /etc/nginx/sites-enabled/ 2>/dev/null
grep -rn "server_name" /etc/nginx/conf.d/ 2>/dev/null

echo ""
echo "=DEFAULT_SERVER_CHECK="
grep -rn "default_server" /etc/nginx/ 2>/dev/null

echo ""
echo "=ALPHAKOLECT_CONF_LOCATIONS="
find /etc/nginx -name '*alphakolect*' 2>/dev/null
find /usr/local/webuzo -name '*alphakolect*' 2>/dev/null
find /var/webuzo -name '*alphakolect*' 2>/dev/null

echo ""
echo "=WEBUZO_VH_CONF="
find / -name 'webuzoVH.conf' 2>/dev/null | head -5

echo ""
echo "=WEBUZO_CONF_FILES="
find /usr/local/webuzo /var/webuzo -name '*.conf' 2>/dev/null | head -30

echo ""
echo "=MAIN_NGINX_CONF="
cat /etc/nginx/nginx.conf 2>/dev/null

} > /tmp/nginx_diag.txt 2>&1
echo "DONE"
"""

result = run(ssh, script)
print(result)

sftp = ssh.open_sftp()
sftp.get('/tmp/nginx_diag.txt', r'C:\Users\trade\Documents\nginx_diag.txt')
sftp.close()
ssh.close()
print("Downloaded!")
