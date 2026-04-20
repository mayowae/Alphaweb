import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password)

def run(cmd):
    print(f"Executing: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out: print(f"OUT: {out}")
    if err: print(f"ERR: {err}")
    return out, err

remote_root = '/home/mayowae/public_html/alphaweb'

print("--- AGGRESSIVE CLEANUP ---")
run("pkill -9 -f node || true")
run("pkill -9 -f next || true")
run("fuser -k -n tcp 3000 || true")
run("fuser -k -n tcp 3001 || true")
run("fuser -k -n tcp 3002 || true")

print("--- deleting .next cache ---")
run(f"rm -rf {remote_root}/.next")

time.sleep(5)

print("--- starting npm run dev ---")
run(f"cd {remote_root} && (nohup env NODE_OPTIONS='--max-old-space-size=2048' npm run dev > dev.log 2>&1 &)")

print("--- waiting for port 3000 ---")
for i in range(20):
    time.sleep(10)
    out, _ = run("netstat -tulpn | grep :3000")
    if ":3000" in out:
        print("--- UP on 3000! ---")
        break
    else:
        print(f"Still waiting ({i+1}/20)...")
        run("netstat -tulpn | grep node || true")

client.close()
