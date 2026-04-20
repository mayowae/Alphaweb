import paramiko

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
    return out, err

print("=== Restarting backend ===")
out, _ = run("pm2 restart all --no-color 2>&1")
with open("restart_output.txt", "w", encoding="utf-8") as f:
    f.write(out)
print("Restart done. Output written to restart_output.txt")

print("=== PM2 status ===")
out, _ = run("pm2 list --no-color 2>&1")
with open("pm2_status.txt", "w", encoding="utf-8") as f:
    f.write(out)
print("Status written to pm2_status.txt")

client.close()
