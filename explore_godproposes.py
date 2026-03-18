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

# Explore what's available in the godproposescollege directory
banner("Exploring godproposescollege.com directory structure")
print(run(ssh, r"""
BASE="/home/mayowae/godproposescollege.com"

echo "=== Top-level contents ==="
ls -la "$BASE/"

echo ""
echo "=== backup/ directory ==="
ls -la "$BASE/backup/" 2>/dev/null | head -20

echo ""
echo "=== update/ directory ==="
ls -la "$BASE/update/" 2>/dev/null | head -20

echo ""
echo "=== smart_school_src/ contents ==="
ls "$BASE/update/smart_school_src/" 2>/dev/null | head -30

echo ""
echo "=== Smart School src structure ==="
find "$BASE/update/smart_school_src/" -maxdepth 2 -type d 2>/dev/null | head -30

echo ""
echo "=== Is there an index.php in smart_school_src? ==="
find "$BASE/update/smart_school_src/" -name 'index.php' -maxdepth 2 2>/dev/null | head -5

echo ""
echo "=== Database: mayowae_schoolgodpro tables ==="
mysql -uroot -e "USE mayowae_schoolgodpro; SHOW TABLES;" 2>/dev/null | head -20

echo ""
echo "=== Any zip/tar archives of the site? ==="
find "$BASE" -name '*.zip' -o -name '*.tar.gz' -o -name '*.tar' 2>/dev/null | head -10
find /home/mayowae/ -name '*.zip' 2>/dev/null | grep -i "godproposes\|school" | head -5
"""))

ssh.close()
