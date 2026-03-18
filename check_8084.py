import paramiko

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"
OUT_FILE = r"C:\Users\trade\Documents\Alphaweb-main\fix_8084.txt"

def run(ssh, cmd, timeout=60):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    stdout.channel.recv_exit_status()
    o = stdout.read().decode("utf-8", errors="replace").strip()
    e = stderr.read().decode("utf-8", errors="replace").strip()
    return (o + ("\n" + e if e else "")).strip()

lines = []
def say(*args):
    msg = " ".join(str(a) for a in args)
    print(msg)
    lines.append(msg)

def banner(t):
    say(f"\n{'='*60}\n  {t}\n{'='*60}")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, 22, SSH_USER, SSH_PASS, timeout=10, allow_agent=False, look_for_keys=False)
say("Connected")

# ─── IDENTIFY: Which nginx is serving which domains? ─────────────────────────
banner("CHECK 1: Multiple nginx instances running")
say(run(ssh, "ps aux | grep nginx | grep -v grep"))

banner("CHECK 2: All nginx conf.d files content")
say(run(ssh, "for f in /etc/nginx/conf.d/*.conf; do echo \"=== $f ===\"; cat $f; echo; done"))

banner("CHECK 3: Old Webuzo nginx config (looking for port 8084 references)")
say(run(ssh, r"""
# Check if old Webuzo nginx configs still reference 8084
grep -rn '8084' /usr/local/emps/etc/nginx/ 2>/dev/null | head -30
echo "---"
grep -rn '8084' /etc/nginx/ 2>/dev/null | head -30
"""))

banner("CHECK 4: What IS listening on 8084?")
say(run(ssh, "ss -tlnp | grep 8084 || echo 'NOTHING on 8084 (confirms connection refused)'"))

banner("CHECK 5: Webuzo nginx config - what domains/upstreams it has")
say(run(ssh, r"""
cat /usr/local/emps/etc/nginx/nginx.conf 2>/dev/null | head -40
echo "---"
ls /usr/local/emps/etc/nginx/conf.d/ 2>/dev/null || echo 'no conf.d'
ls /usr/local/emps/etc/nginx/vhosts/ 2>/dev/null || echo 'no vhosts'
"""))

banner("CHECK 6: Current nginx -T (full config dump) - proxy_pass lines")
say(run(ssh, "nginx -T 2>/dev/null | grep -E 'proxy_pass|server_name|listen' | head -60"))

banner("CHECK 7: Webuzo nginx - is it still active?")
say(run(ssh, r"""
systemctl status webuzo-nginx 2>/dev/null | head -20 || echo 'no webuzo-nginx service'
/usr/local/emps/sbin/nginx -v 2>&1 | head -5
"""))

ssh.close()
say("\nDone.")

with open(OUT_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"\n✅ Saved to {OUT_FILE}")
