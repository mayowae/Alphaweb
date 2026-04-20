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

print("=== Fixing all Relative api imports using @/services/api ===")

# Search for any line that imports from something that ends with services/api
# and starts with relative dots
find_cmd = "grep -rl \"from '[.][.][./]*services/api'\" /home/mayowae/public_html/alphaweb/src/"
files = run(find_cmd).splitlines()

for f in files:
    f = f.strip()
    if not f: continue
    
    print(f"Fixing imports in {f}...")
    # Use sed to replace any string matching '../../.../services/api' with '@/services/api'
    # The regex [./]* handles any number of dots or slashes before 'services/api'
    # We'll use double quotes on the shell command to escape correctly
    sed_cmd = f"sed -i \"s|'\\.\\.\\/[.\\.\\/]*services/api'|'@/services/api'|g\" \"{f}\""
    run(sed_cmd)
    # Also handle double quotes in imports if any
    sed_cmd_2 = f"sed -i 's|\"\\.\\.\\/[.\\.\\/]*services/api\"|\"@/services/api\"|g' \"{f}\""
    run(sed_cmd_2)

print("Now triggering build...")
build_cmd = "cd /home/mayowae/public_html/alphaweb && npm run build --no-color > build.log 2>&1 &"
run(build_cmd)

print("Build started. Waiting 10 seconds for it to get going...")
import time
time.sleep(10)

print("Done.")
client.close()
