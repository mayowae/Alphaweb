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

print("--- full stop ---")
run("pm2 stop all")
run("pkill -9 node")
run("pkill -9 next")

print("--- check RAM ---")
print(run("free -m"))

print("--- rebuilding with dedicated RAM ---")
# Use 1.5GB for build (from 2GB total + Swap)
# Next 15 needs it for webpacking
cmd = "cd /home/mayowae/public_html/alphaweb && rm -rf .next && NODE_OPTIONS='--max-old-space-size=1536' npx next build --no-lint --no-type-check"
out, err = run(cmd)
print("OUT:", out)
print("ERR:", err)

print("--- building done, check BUILD_ID ---")
print(run("ls -la /home/mayowae/public_html/alphaweb/.next/BUILD_ID"))

client.close()
