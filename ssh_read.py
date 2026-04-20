import paramiko
import sys
import json
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out.strip(), err.strip()

base = '/home/mayowae/public_html/alphaweb'

results = {}

# Backend structure
results['backend_src_ls'], _ = run(f"ls {base}/backend/src/ 2>/dev/null")
results['backend_routes'], _ = run(f"ls {base}/backend/src/routes/ 2>/dev/null")

# Specific files to read
files_to_read = [
    f"{base}/src/app/layout.tsx",
    f"{base}/src/app/page.tsx",
    f"{base}/src/app/pricing/page.tsx",
]

for file_path in files_to_read:
    content, _ = run(f"cat {file_path} 2>/dev/null | head -n 100")
    results[file_path] = content

# Search for Collaborator login route
results['collab_route'], _ = run(f"grep -rn 'collaborator' {base}/backend/src/routes {base}/backend/server.js {base}/backend/src/app.js {base}/src/app 2>/dev/null | head -n 20")

# Search for OTP related routes/controllers
results['otp_search'], _ = run(f"grep -rn 'Forgot Password' {base}/src/app 2>/dev/null | head -n 10")
results['resend_otp_search'], _ = run(f"grep -rn 'Resend OTP' {base}/src/app 2>/dev/null | head -n 20")

# Search for Create Collection Package
results['create_package_ui'], _ = run(f"grep -rn 'Create Collection Package' {base}/src/app 2>/dev/null | head -n 10")

output_file = os.path.join(os.path.dirname(__file__), 'explore3.json')
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

client.close()
