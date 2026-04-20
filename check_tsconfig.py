import paramiko
import re

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace')

print("=== Fixing invalid api imports with proper quoting ===")

# Find all files with "services/api"
find_cmd = "grep -rl \"services/api\" /home/mayowae/public_html/alphaweb/src/"
files = run(find_cmd).splitlines()

for f in files:
    f = f.strip()
    if not f: continue
    
    # Read file content safely
    # We use base64 or just read it line by line? or cat?
    # Better yet, use sed but quote the filename carefully
    print(f"Checking {f}...")
    
    # We want to replace any number of dots (7, 8, etc.) with 6 (Wait! or 5?)
    # Let's count again.
    # Root: /home/mayowae/public_html/alphaweb/
    # File: /home/mayowae/public_html/alphaweb/src/app/dashboard/(pages)/collection/Addpackage.tsx
    # Levels:
    # 1. (pages)/collection/ -> (pages)/ (../)
    # 2. (pages)/ -> dashboard/ (../../)
    # 3. dashboard/ -> app/ (../../../)
    # 4. app/ -> src/ (../../../../)
    # 5. src/ -> root/ (../../../../../)
    # So actually it is 5 levels!
    
    # WAIT! There is also: /home/mayowae/public_html/alphaweb/src/app/dashboard/(pages)/collection/(pages)/remittance/page.tsx
    # Let's count for this one:
    # 1. remittance/ -> (pages)/ (../)
    # 2. (pages)/ -> collection/ (../../)
    # 3. collection/ -> (pages)/ (../../../)
    # 4. (pages)/ -> dashboard/ (../../../../)
    # 5. dashboard/ -> app/ (../../../../../)
    # 6. app/ -> src/ (../../../../../../)
    # 7. src/ -> root/ (../../../../../../../)
    # THAT IS 7 LEVELS!
    
    # Okay, so the "too many dots" error depends on the file depth.
    # The build error in Step 2484 said for Addpackage.tsx (depth 4-5) that 7 dots is too many.
    
    # I'll just use 5 dots for all collection files?
    # No, I'll use a safer approach: use '@' or relative to root if Next.js supports it (e.g. "@/services/api").
    # Does this project use paths in tsconfig.json?
    
    # Let's check tsconfig.json.
    out = run("cat /home/mayowae/public_html/alphaweb/tsconfig.json")
    print(out)
    
    client.close()
    break
