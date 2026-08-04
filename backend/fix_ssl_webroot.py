import paramiko

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOSTNAME, port=22, username=USERNAME, password=PASSWORD)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

def safe_print(*args):
    import sys
    text = " ".join(str(a) for a in args)
    encoded = text.encode(sys.stdout.encoding or 'utf-8', errors='replace')
    sys.stdout.buffer.write(encoded + b'\n')

def run_and_print(cmd):
    safe_print(f"--- {cmd} ---")
    out, err = run(cmd)
    if out.strip(): safe_print(out)
    if err.strip(): safe_print(f"ERR: {err}")
    return out, err

CORRECT_WEBROOT = '/var/webuzo-data/www'

# List acme.sh domain directories correctly
safe_print("=== All acme.sh domain folders ===")
out, _ = run("ls -d /home/mayowae/.acme.sh/*/")
safe_print(out)

# Extract domain names from directory listing
dirs = [d.strip().rstrip('/') for d in out.splitlines() if d.strip()]
domains = [d.split('/')[-1] for d in dirs if d.split('/')[-1] != 'ca']
safe_print(f"Domains found: {domains}")

safe_print("\n=== Fixing Le_Webroot in each acme.sh domain config ===")
for domain in domains:
    conf = f"/home/mayowae/.acme.sh/{domain}/{domain}.conf"
    out, _ = run(f"cat {conf} 2>/dev/null || echo 'NO CONF'")
    if 'NO CONF' in out:
        safe_print(f"SKIP {domain} - no conf")
        continue

    current = ""
    for line in out.splitlines():
        if "Le_Webroot" in line:
            current = line.strip()

    if f"Le_Webroot='{CORRECT_WEBROOT}'" in out:
        safe_print(f"OK   {domain} - already correct: {current}")
    else:
        run(f"sed -i \"s|Le_Webroot='.*'|Le_Webroot='{CORRECT_WEBROOT}'|\" {conf}")
        out2, _ = run(f"grep Le_Webroot {conf}")
        safe_print(f"FIXED {domain}: {current}  =>  {out2.strip()}")

safe_print("\n=== Current state of /var/webuzo-data/www ===")
run_and_print("ls -laR /var/webuzo-data/www/")

safe_print("\n=== Test: write and read a test file via curl to verify nginx serves it ===")
run("echo 'acme_test_ok' > /var/webuzo-data/www/.well-known/acme-challenge/test_file.txt")
run_and_print("curl -s http://paxalphaltd.com/.well-known/acme-challenge/test_file.txt")
run("rm -f /var/webuzo-data/www/.well-known/acme-challenge/test_file.txt")

client.close()
