import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace'), stderr.read().decode('utf-8', errors='replace')

print("--- killing everything on 3000 ---")
run("fuser -k 3000/tcp || true")

print("--- starting npm run dev with NODE_OPTIONS ---")
run("cd /home/mayowae/public_html/alphaweb && (nohup env NODE_OPTIONS='--max-old-space-size=1536' npm run dev > dev.log 2>&1 &)")

for i in range(10):
    print(f"Waiting for NEXT-DEV... ({i+1}/10)")
    time.sleep(10)
    out, _ = run("netstat -tulpn | grep :3000")
    if ":3000" in out:
        print("--- it is UP! ---")
        print(out)
        break
    else:
        print("Still waiting...")
        run("tail -n 5 /home/mayowae/public_html/alphaweb/dev.log")

client.close()


