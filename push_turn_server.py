import paramiko
import time

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('159.198.36.24', 22, 'root', '96eUC4aTbMu1o3yAP2')

print("Locating turn server...")
stdin, stdout, stderr = client.exec_command('find /home /root /opt /var -type d -name "turn-server" 2>/dev/null')
turn_dirs = stdout.read().decode('utf-8').strip().split('\n')
turn_dirs = [d for d in turn_dirs if d]

if not turn_dirs:
    # Also check for just 'turn'
    stdin, stdout, stderr = client.exec_command('find /home /root /opt /var -maxdepth 2 -type d -name "*turn*" 2>/dev/null')
    turn_dirs = stdout.read().decode('utf-8').strip().split('\n')
    turn_dirs = [d for d in turn_dirs if d]

print("Found directories:", turn_dirs)

if not turn_dirs:
    print("Could not find turn server directory.")
    client.close()
    exit(1)

target_dir = turn_dirs[0]
print("Using directory:", target_dir)

commands = [
    f'cd {target_dir} && git init',
    f'cd {target_dir} && git add .',
    f'cd {target_dir} && git commit -m "first commit"',
    f'cd {target_dir} && git branch -M main',
    f'cd {target_dir} && git remote remove origin || true',
    f'cd {target_dir} && git remote add origin https://github.com/charlly-code/turn-server.git',
    f'cd {target_dir} && git push -u origin main'
]

for cmd in commands:
    print(f"Running: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    if out:
        print("OUT:", out)
    if err:
        print("ERR:", err)

client.close()
