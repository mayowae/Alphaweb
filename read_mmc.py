import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('fix_syntax.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

BASE = '/home/mayowae/public_html/alphaweb'
sftp = client.open_sftp()

# ─────────────────────────────────────────────────────────────
# FIX 1: Read the broken merchantManagementController, find the
# bad injection point and fix the syntax error at line 288
# ─────────────────────────────────────────────────────────────
p("=== Reading merchantManagementController (lines 250-310) ===")
out = run(f"sed -n '250,310p' {BASE}/backend/controllers/merchantManagementController.js")
p(out)

with sftp.open(f'{BASE}/backend/controllers/merchantManagementController.js', 'r') as f:
    mmc = f.read().decode('utf-8')

p(f"\nTotal length: {len(mmc)} chars")
# Find the broken area around line 288
lines = mmc.split('\n')
p(f"Total lines: {len(lines)}")
p("Lines 282-295:")
p('\n'.join(f"{i+1}: {lines[i]}" for i in range(281, min(295, len(lines)))))

log.close()
sftp.close()
print("Done - see fix_syntax.txt")
client.close()
