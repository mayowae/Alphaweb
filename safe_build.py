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

print("--- stopping all services ---")
run("pm2 stop all")

print("--- rebuilding frontend with minimal memory profile ---")
# Use npx directly and skip linting/typecheck
# --no-lint and --no-type-check are available in next build
cmd = "cd /home/mayowae/public_html/alphaweb && rm -rf .next && NODE_OPTIONS='--max-old-space-size=1024' npx next build --no-lint"
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
    print("--- BUILD FAILED! ---")

client.close()
