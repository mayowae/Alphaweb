import paramiko

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"
OUT_FILE = r"C:\Users\trade\Documents\Alphaweb-main\disable_webuzo2.txt"

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

# ─── STEP 1: Force-mask Webuzo systemd services ──────────────────────────────
banner("STEP 1: Force-mask Webuzo systemd services")
say(run(ssh, r"""
# The mask failed because the .service files exist at /etc/systemd/system/
# We overwrite them with symlinks to /dev/null (the proper mask)
for svc in webuzo.service webuzo-onboot.service; do
    TARGET="/etc/systemd/system/$svc"
    echo "--- Masking $TARGET ---"
    # Remove existing file, then link to /dev/null
    rm -f "$TARGET"
    ln -s /dev/null "$TARGET"
    echo "  Masked: $TARGET -> /dev/null"
done

systemctl daemon-reload
echo ""
echo "=== Verify mask ==="
systemctl status webuzo.service 2>&1 | head -5
systemctl status webuzo-onboot.service 2>&1 | head -5
"""))

# ─── STEP 2: Stop the run-webuzo.mount unit ──────────────────────────────────
banner("STEP 2: Dismount and mask run-webuzo.mount")
say(run(ssh, r"""
echo "=== Current run-webuzo.mount status ==="
systemctl status run-webuzo.mount 2>&1 | head -8

echo ""
echo "Stopping run-webuzo.mount..."
systemctl stop run-webuzo.mount 2>&1 || echo "stop failed"

echo "Masking run-webuzo.mount..."
systemctl mask run-webuzo.mount 2>&1 || echo "mask failed"

echo ""
echo "=== Verify ==="
systemctl status run-webuzo.mount 2>&1 | head -5
"""))

# ─── STEP 3: Kill orphan nginx cache manager processes ───────────────────────
banner("STEP 3: Kill orphan 'nobody' nginx cache manager processes")
say(run(ssh, r"""
echo "=== Orphan nobody nginx processes ==="
ps aux | grep 'nginx: cache manager' | grep nobody

echo ""
echo "Killing orphan nginx cache managers..."
pkill -9 -f 'nginx: cache manager' 2>/dev/null && echo "Killed" || echo "None to kill"

sleep 1
echo ""
echo "=== Remaining nginx processes ==="
ps aux | grep nginx | grep -v grep
"""))

# ─── STEP 4: Remove remaining Webuzo cron files entirely ──────────────────────
banner("STEP 4: Remove ALL remaining Webuzo/Softaculous cron files")
say(run(ssh, r"""
echo "=== Files to remove ==="
ls -la /etc/cron.d/emps /etc/cron.d/lets_encrypt /etc/cron.d/softaculous /etc/cron.d/softaculous2 /etc/cron.d/backuply /etc/cron.d/backuply2 2>/dev/null

echo ""
echo "Removing..."
for f in emps lets_encrypt softaculous softaculous2 backuply backuply2; do
    if [ -f "/etc/cron.d/$f" ]; then
        rm -f "/etc/cron.d/$f"
        echo "  Removed: /etc/cron.d/$f"
    else
        echo "  Not found: /etc/cron.d/$f"
    fi
done

echo ""
echo "=== Remaining /etc/cron.d/ files ==="
ls -la /etc/cron.d/
"""))

# ─── STEP 5: Disable Webuzo php-fpm (emps) ────────────────────────────────────
banner("STEP 5: Stop and disable Webuzo php-fpm (/usr/local/emps)")
say(run(ssh, r"""
echo "=== Webuzo php-fpm processes ==="
ps aux | grep 'emps/etc/php-fpm' | grep -v grep

echo ""
echo "Killing Webuzo php-fpm..."
pkill -9 -f '/usr/local/emps/etc/php-fpm' 2>/dev/null && echo "Killed" || echo "None found"

# Also rename the emps php-fpm binary to prevent restart
EMPS_PHP_FPM="/usr/local/emps/sbin/php-fpm"
if [ -f "$EMPS_PHP_FPM" ]; then
    mv "$EMPS_PHP_FPM" "${EMPS_PHP_FPM}.disabled"
    echo "Disabled: $EMPS_PHP_FPM"
fi

# Rename the emps php binary too
EMPS_PHP="/usr/local/emps/bin/php"
if [ -f "$EMPS_PHP" ]; then
    mv "$EMPS_PHP" "${EMPS_PHP}.disabled"
    echo "Disabled: $EMPS_PHP"
fi

sleep 1
echo ""
echo "=== Remaining emps processes ==="
ps aux | grep -E 'emps|webuzo' | grep -v grep || echo "CLEAN - none"
"""))

# ─── STEP 6: Remove Webuzo rc.d boot symlinks ─────────────────────────────────
banner("STEP 6: Remove Webuzo rc.d boot symlinks")
say(run(ssh, r"""
echo "Removing rc.d webuzo symlinks..."
find /etc/rc*.d /etc/rc.d/rc*.d -name '*webuzo*' 2>/dev/null | while read f; do
    echo "  Removing: $f"
    rm -f "$f"
done

echo ""
echo "=== Verify - remaining webuzo rc.d links ==="
find /etc/rc*.d /etc/rc.d/rc*.d -name '*webuzo*' 2>/dev/null || echo "CLEAN - none remaining"
"""))

# ─── STEP 7: Final comprehensive check ───────────────────────────────────────
banner("STEP 7: Final verification — complete Webuzo shutdown")
say(run(ssh, r"""
echo "=== 1. Running processes ==="
ps aux | grep -iE 'webuzo|/usr/local/emps' | grep -v grep || echo "  CLEAN"

echo ""
echo "=== 2. Active systemd webuzo units ==="
systemctl list-units --all 2>/dev/null | grep -i webuzo || echo "  CLEAN"

echo ""
echo "=== 3. Webuzo cron entries ==="
grep -ri webuzo /etc/cron.d/ /etc/crontab /var/spool/cron/ 2>/dev/null || echo "  CLEAN"

echo ""
echo "=== 4. Webuzo rc.d boot links ==="
find /etc/rc*.d /etc/rc.d/rc*.d -name '*webuzo*' 2>/dev/null || echo "  CLEAN"

echo ""
echo "=== 5. Ports in use ==="
ss -tlnp | grep -E ':80 |:443 |:8081 |:8080 '

echo ""
echo "=== 6. Active nginx processes ==="
ps aux | grep nginx | grep -v grep

echo ""
echo "=== 7. Webuzo disabled binaries ==="
ls /usr/local/emps/sbin/*.disabled /usr/local/emps/bin/*.disabled 2>/dev/null || echo "  none"

echo ""
echo "=== 8. Systemd masked services ==="
systemctl list-unit-files 2>/dev/null | grep -i webuzo
"""))

ssh.close()
say("\nDone.")

with open(OUT_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"\n✅ Saved to {OUT_FILE}")
