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
    return stdout.read().decode('utf-8', errors='replace')

print("=== Modifying .env.production safely ===")
# Sed it! Using pipe separator to avoid slash issues
sed_cmd = "sed -i 's|https://alphakolect.com:8082|https://alphakolect.com|g' /home/mayowae/public_html/alphaweb/.env.production"
run(sed_cmd)

# Verify
out = run("cat /home/mayowae/public_html/alphaweb/.env.production")
print(out)

print("Starting FINAL BUILD...")
run("cd /home/mayowae/public_html/alphaweb && npm run build --no-color > build_final.log 2>&1 &")

print("Done.")
client.close()
