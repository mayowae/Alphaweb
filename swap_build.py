import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=900)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace'), stderr.read().decode('utf-8', errors='replace')

print("--- creating 2GB swap file ---")
run("fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile || true")
print(run("free -m"))

print("--- rebuilding frontend with swap ---")
cmd = "cd /home/mayowae/public_html/alphaweb && rm -rf .next && npm run build"
out, err = run(cmd)
print("OUT:", out)
print("ERR:", err)

print("--- check if BUILD_ID exists ---")
out, err = run("ls -la /home/mayowae/public_html/alphaweb/.next/BUILD_ID")
print("BUILD_ID:", out)

if "BUILD_ID" in out:
    print("--- starting everything ---")
    run("pm2 start all")
    run("cd /home/mayowae/public_html/alphaweb && (nohup npm start > next.log 2>&1 &)")
else:
    print("--- BUILD FAILED! STILL! ---")

# Optional: Clean up swap if needed, but better to keep it for stable operations on 2GB RAM
# run("swapoff /swapfile && rm /swapfile")

client.close()
