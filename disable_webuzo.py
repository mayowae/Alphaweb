import paramiko, time

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"
OUT_FILE = r"C:\Users\trade\Documents\Alphaweb-main\disable_webuzo.txt"

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

# ─── STEP 1: Discover all Webuzo-related services ────────────────────────────
banner("STEP 1: Discover all Webuzo services")
say(run(ssh, r"""
echo "=== systemctl services with 'webuzo' ==="
systemctl list-units --all 2>/dev/null | grep -i webuzo | awk '{print $1}'

echo ""
echo "=== systemctl unit files with 'webuzo' ==="
systemctl list-unit-files 2>/dev/null | grep -i webuzo

echo ""
echo "=== init.d scripts with 'webuzo' ==="
ls /etc/init.d/ 2>/dev/null | grep -i webuzo

echo ""
echo "=== rc*.d symlinks for webuzo ==="
find /etc/rc*.d/ -name '*webuzo*' 2>/dev/null

echo ""
echo "=== /usr/local/emps services ==="
systemctl list-units --all 2>/dev/null | grep -iE 'emps|webuzo|softaculous'
"""))

# ─── STEP 2: Stop and disable all Webuzo systemd services ────────────────────
banner("STEP 2: Stop and disable all Webuzo systemd services")
say(run(ssh, r"""
# Get all webuzo-related service names
SERVICES=$(systemctl list-unit-files 2>/dev/null | grep -i webuzo | awk '{print $1}')

if [ -z "$SERVICES" ]; then
    echo "No systemd webuzo services found (may use init.d)"
else
    for svc in $SERVICES; do
        echo "--- Stopping & disabling: $svc ---"
        systemctl stop "$svc" 2>&1 && echo "  stopped OK" || echo "  stop failed/already stopped"
        systemctl disable "$svc" 2>&1 && echo "  disabled OK" || echo "  disable failed"
        systemctl mask "$svc" 2>&1 && echo "  masked OK" || echo "  mask failed"
    done
fi
"""))

# ─── STEP 3: Stop Webuzo nginx (the /usr/local/emps one) ─────────────────────
banner("STEP 3: Kill Webuzo nginx process (/usr/local/emps/sbin/nginx)")
say(run(ssh, r"""
echo "=== Webuzo nginx pids ==="
pids=$(ps aux | grep 'emps/sbin/nginx' | grep -v grep | awk '{print $2}')
echo "PIDs: $pids"

if [ -n "$pids" ]; then
    echo "Killing Webuzo nginx processes..."
    kill -QUIT $pids 2>/dev/null && echo "Sent QUIT signal"
    sleep 2
    # Force kill if still running
    pids2=$(ps aux | grep 'emps/sbin/nginx' | grep -v grep | awk '{print $2}')
    if [ -n "$pids2" ]; then
        echo "Force killing remaining: $pids2"
        kill -9 $pids2 2>/dev/null
    fi
else
    echo "No Webuzo nginx processes running"
fi

echo ""
echo "=== Remaining nginx processes ==="
ps aux | grep nginx | grep -v grep
"""))

# ─── STEP 4: Stop Webuzo main process ────────────────────────────────────────
banner("STEP 4: Kill all remaining Webuzo processes")
say(run(ssh, r"""
echo "=== All webuzo-related processes ==="
ps aux | grep -iE 'webuzo|softaculous|emps' | grep -v grep

echo ""
echo "Killing webuzo processes..."
pkill -9 -f 'webuzo' 2>/dev/null && echo "Killed webuzo procs" || echo "None found"
pkill -9 -f '/usr/local/emps' 2>/dev/null && echo "Killed emps procs" || echo "None found"

sleep 1
echo ""
echo "=== Remaining webuzo/emps processes ==="
ps aux | grep -iE 'webuzo|/usr/local/emps' | grep -v grep || echo "None remaining"
"""))

# ─── STEP 5: Disable init.d Webuzo scripts ───────────────────────────────────
banner("STEP 5: Disable Webuzo init.d scripts")
say(run(ssh, r"""
for script in $(ls /etc/init.d/ 2>/dev/null | grep -i webuzo); do
    echo "--- Disabling init.d: $script ---"
    /etc/init.d/$script stop 2>&1 || echo "  stop failed"
    # Disable from all runlevels
    update-rc.d "$script" disable 2>/dev/null || \
    chkconfig "$script" off 2>/dev/null || \
    echo "  could not disable via update-rc.d or chkconfig"
    echo "  done"
done

# Also check for emps nginx init script
for script in $(ls /etc/init.d/ 2>/dev/null | grep -iE 'emps|softaculous'); do
    echo "--- Disabling init.d: $script ---"
    /etc/init.d/$script stop 2>&1 || echo "  stop failed"
    update-rc.d "$script" disable 2>/dev/null || chkconfig "$script" off 2>/dev/null || true
    echo "  done"
done
"""))

# ─── STEP 6: Remove Webuzo cron jobs ─────────────────────────────────────────
banner("STEP 6: Find and remove all Webuzo cron jobs")
say(run(ssh, r"""
echo "=== System crontab (/etc/crontab) ==="
grep -i webuzo /etc/crontab 2>/dev/null || echo "  none"

echo ""
echo "=== /etc/cron.d/ directory ==="
ls /etc/cron.d/ 2>/dev/null
grep -ri webuzo /etc/cron.d/ 2>/dev/null || echo "  none in cron.d"

echo ""
echo "=== Root crontab ==="
crontab -l 2>/dev/null | head -30

echo ""
echo "=== Webuzo user crontab ==="
crontab -u webuzo -l 2>/dev/null || echo "  no webuzo crontab"

echo ""
echo "=== All user crontabs with webuzo references ==="
for user in root webuzo mayowae; do
    echo "-- crontab for $user --"
    crontab -u "$user" -l 2>/dev/null | grep -i webuzo || echo "  none"
done

echo ""
echo "=== /var/spool/cron/ ==="
ls /var/spool/cron/ 2>/dev/null
grep -ri webuzo /var/spool/cron/ 2>/dev/null || echo "  none"
"""))

# ─── STEP 7: Remove Webuzo cron entries ──────────────────────────────────────
banner("STEP 7: Remove Webuzo cron entries from all crontabs")
say(run(ssh, r"""
# Remove webuzo cron.d files
for f in $(ls /etc/cron.d/ 2>/dev/null | grep -i webuzo); do
    echo "Removing /etc/cron.d/$f"
    rm -f "/etc/cron.d/$f"
done

# Remove webuzo entries from root crontab
if crontab -l 2>/dev/null | grep -qi webuzo; then
    echo "Removing webuzo entries from root crontab..."
    crontab -l 2>/dev/null | grep -iv webuzo | crontab -
    echo "Done"
else
    echo "No webuzo entries in root crontab"
fi

# Remove entire webuzo user crontab
crontab -u webuzo -r 2>/dev/null && echo "Removed webuzo user crontab" || echo "No webuzo user crontab to remove"

# Check /etc/crontab for webuzo lines and remove them
if grep -qi webuzo /etc/crontab 2>/dev/null; then
    echo "Removing webuzo lines from /etc/crontab..."
    sed -i '/webuzo/Id' /etc/crontab
    echo "Done"
fi

echo ""
echo "=== Verify: remaining webuzo cron entries ==="
grep -ri webuzo /etc/cron* /var/spool/cron/ 2>/dev/null || echo "  CLEAN - no webuzo cron entries remaining"
"""))

# ─── STEP 8: Prevent Webuzo nginx from auto-starting on boot ─────────────────
banner("STEP 8: Prevent Webuzo nginx from auto-starting on boot")
say(run(ssh, r"""
EMPS_NGINX="/usr/local/emps/sbin/nginx"
EMPS_CONF="/usr/local/emps/etc/nginx/nginx.conf"

# Rename the webuzo nginx binary so it can't start
if [ -f "$EMPS_NGINX" ]; then
    echo "Renaming Webuzo nginx binary to prevent auto-start..."
    mv "$EMPS_NGINX" "${EMPS_NGINX}.disabled"
    echo "Renamed: $EMPS_NGINX -> ${EMPS_NGINX}.disabled"
else
    echo "Webuzo nginx binary not found (already disabled or removed)"
fi

# Also check for any systemd override
SYSTEMD_UNITS=$(find /etc/systemd /usr/lib/systemd -name '*webuzo*' -o -name '*emps*' 2>/dev/null)
if [ -n "$SYSTEMD_UNITS" ]; then
    echo ""
    echo "=== Webuzo systemd unit files found ==="
    echo "$SYSTEMD_UNITS"
    for unit in $SYSTEMD_UNITS; do
        echo "Masking: $unit"
        svc=$(basename "$unit")
        systemctl mask "$svc" 2>/dev/null || echo "  could not mask $svc"
    done
fi

echo ""
echo "=== Check if /etc/rc.local runs webuzo ==="
grep -i webuzo /etc/rc.local 2>/dev/null || echo "  none in rc.local"
"""))

# ─── STEP 9: Final verification ──────────────────────────────────────────────
banner("STEP 9: Final verification — no Webuzo running")
say(run(ssh, r"""
echo "=== Running processes (webuzo/emps) ==="
ps aux | grep -iE 'webuzo|/usr/local/emps/sbin/nginx' | grep -v grep || echo "  CLEAN - no webuzo/emps processes"

echo ""
echo "=== Ports still in use ==="
ss -tlnp | grep -E '80|443|8080|8081|8082'

echo ""
echo "=== Systemd webuzo services status ==="
systemctl list-units --all 2>/dev/null | grep -i webuzo || echo "  no webuzo systemd units active"

echo ""
echo "=== Webuzo binary status ==="
ls -la /usr/local/emps/sbin/nginx* 2>/dev/null || echo "  not found"

echo ""
echo "=== Remaining nginx instances ==="
ps aux | grep nginx | grep -v grep
"""))

ssh.close()
say("\nDone.")

with open(OUT_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"\n✅ Saved to {OUT_FILE}")
