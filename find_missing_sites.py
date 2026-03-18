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
print("✅ Connected")

result = run(ssh, r"""
echo "======= ALL SITE DOCUMENT ROOTS ======="
for domain in alphakolect.com bhislass.com paxalphaltd.com kosheglobal.com \
    vinemorrisgroup.com modoniteintegrated.com.ng suppakash.com \
    godproposescollege.com thepeopleimpact.com; do
    COUNT=$(find /home/mayowae/$domain -maxdepth 1 -type f 2>/dev/null | wc -l)
    HAS_WP=$([ -f "/home/mayowae/$domain/wp-config.php" ] && echo "YES" || echo "no")
    echo "  $domain: $COUNT files, WordPress=$HAS_WP"
done

echo ""
echo "======= SEARCHING FOR MISSING SITE FILES ======="
echo "-- godproposescollege files in other locations --"
find / -name 'wp-config.php' 2>/dev/null | grep -i "godproposes\|godpropose" | head -5
find /var/webuzo-data -name '*.zip' 2>/dev/null | grep -i "godproposes" | head -5
find /home -name '*.sql' 2>/dev/null | grep -i "godproposes" | head -3

echo ""
echo "-- thepeopleimpact files in other locations --"
find / -name 'wp-config.php' 2>/dev/null | grep -i "thepeopleimpact\|people" | head -5
find /var/webuzo-data -type d -name '*people*' 2>/dev/null | head -5

echo ""
echo "======= WEBUZO DATA DIRECTORIES ======="
ls /var/webuzo-data/ 2>/dev/null
ls /var/webuzo-data/users/ 2>/dev/null | head -10

echo ""
echo "======= ALL WORDPRESS SITES FOUND ON SERVER ======="
find /home /var/www /var/webuzo-data -name 'wp-config.php' 2>/dev/null | head -20

echo ""
echo "======= DATABASE — WordPress tables for missing sites ======="
# Try to find DB credentials from a working site
DB_USER=$(grep "DB_USER" /home/mayowae/bhislass.com/wp-config.php 2>/dev/null | grep -oP "(?<=')[^']+" | head -1)
DB_PASS=$(grep "DB_PASSWORD" /home/mayowae/bhislass.com/wp-config.php 2>/dev/null | grep -oP "(?<=')[^']+" | head -1)

if [ -n "$DB_USER" ]; then
    echo "Searching MySQL for godproposescollege and thepeopleimpact databases..."
    mysql -u"$DB_USER" -p"$DB_PASS" -e "SHOW DATABASES;" 2>/dev/null | grep -iE "godproposes|thepeopleimpact|people"
fi

echo ""
echo "All databases:"
mysql -uroot -e "SHOW DATABASES;" 2>/dev/null | grep -v "information_schema\|performance_schema\|mysql\|sys"
""", timeout=60)

print(result)
with open(r"C:\Users\trade\Documents\Alphaweb-main\missing_sites_check.txt", "w", encoding="utf-8") as f:
    f.write(result)
ssh.close()
print("\nSaved to missing_sites_check.txt")
