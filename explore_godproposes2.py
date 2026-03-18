import paramiko

SSH_HOST = "159.198.36.24"
SSH_USER = "root"
SSH_PASS = "Xr2J2Wx9Unk0l7rI1C"

def run(ssh, cmd, timeout=60):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    stdout.channel.recv_exit_status()
    o = stdout.read().decode("utf-8", errors="replace").strip()
    e = stderr.read().decode("utf-8", errors="replace").strip()
    return (o + ("\n" + e if e else "")).strip()

def banner(t): print(f"\n{'='*60}\n  {t}\n{'='*60}")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(SSH_HOST, 22, SSH_USER, SSH_PASS, timeout=10, allow_agent=False, look_for_keys=False)
print("✅ Connected")

r = run(ssh, r"""
BASE="/home/mayowae/godproposescollege.com"
SRC="$BASE/update/smart_school_src"

echo "=== Top-level contents ==="
ls -la "$BASE/"

echo ""
echo "=== backup/ directory ==="
ls "$BASE/backup/" 2>/dev/null

echo ""
echo "=== update/ directory ==="
ls "$BASE/update/" 2>/dev/null

echo ""
echo "=== smart_school_src top-level ==="
ls "$SRC/" 2>/dev/null | head -30

echo ""
echo "=== Does smart_school_src have index.php? ==="
ls "$SRC/index.php" 2>/dev/null && echo "YES - index.php found" || echo "NO index.php"

echo ""
echo "=== smart_school_src subdirs ==="
find "$SRC" -maxdepth 1 -type d 2>/dev/null

echo ""
echo "=== DB tables in mayowae_schoolgodpro ==="
mysql -uroot -e "USE mayowae_schoolgodpro; SHOW TABLES;" 2>/dev/null | head -30

echo ""
echo "=== Any zip archives ==="
find "$BASE" -name '*.zip' 2>/dev/null | head -10
find /home/mayowae -maxdepth 3 -name '*.zip' 2>/dev/null | grep -i "godproposes\|school" | head -5
""", timeout=60)

print(r)
with open(r"C:\Users\trade\Documents\Alphaweb-main\godproposes_explore.txt", "w", encoding="utf-8") as f:
    f.write(r)
ssh.close()
print("\nSaved to godproposes_explore.txt")
