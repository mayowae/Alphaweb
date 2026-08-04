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

domains = [
    'bhislass.com',
    'paxalphaltd.com',
    'modoniteintegrated.com.ng'
]

for domain in domains:
    print(f"\n=========================================")
    print(f"DOMAIN: {domain}")
    print(f"=========================================")
    mail_path = f"/home/mayowae/mail/{domain}"
    
    # List subdirectories (these correspond to email accounts)
    out, _ = run(f"ls -F {mail_path} | grep '/'")
    accounts = [x.strip().rstrip('/') for x in out.splitlines() if x.strip()]
    
    if not accounts:
        print("No email accounts found.")
        continue
        
    print(f"Email accounts found: {', '.join(accounts)}")
    
    for account in accounts:
        # Count files in cur and new (read and unread emails)
        acct_path = f"{mail_path}/{account}"
        out_cur, _ = run(f"find {acct_path} -type f | wc -l")
        file_count = int(out_cur.strip()) if out_cur.strip().isdigit() else 0
        print(f"  - {account}@{domain}: {file_count} message files / indices")

client.close()
