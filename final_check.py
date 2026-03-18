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
echo "=PORT80="
ss -tulpn | grep ':80 '

echo ""
echo "=PORT443="
ss -tulpn | grep ':443 '

echo ""
echo "=NGINX_PROCS="
ps aux | grep nginx | grep -v grep

echo ""
echo "=CONF_D="
ls /etc/nginx/conf.d/

echo ""
echo "=DOMAIN_CHECK="
for dom in alphakolect.com bhislass.com paxalphaltd.com kosheglobal.com vinemorrisgroup.com modoniteintegrated.com.ng suppakash.com godproposescollege.com thepeopleimpact.com unknown-xyz-test.com; do
    http=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 -H "Host: $dom" http://127.0.0.1/ 2>/dev/null || echo ERR)
    echo "  $dom HTTP=$http"
done

echo ""
echo "=ALPHAWEB_CONF="
cat /etc/nginx/conf.d/alphaweb.conf
""", timeout=120)

print(result)

with open(r"C:\Users\trade\Documents\Alphaweb-main\final_check.txt", "w", encoding="utf-8") as f:
    f.write(result)

ssh.close()
print("Saved to final_check.txt")
