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
    return out, err

print("--- killing all node and next processes ---")
run("pkill -9 node || true")
run("pkill -9 next || true")
run("fuser -k 3000/tcp || true")
run("fuser -k 3002/tcp || true")

time.sleep(2)

print("--- starting npm run dev ---")
remote_root = '/home/mayowae/public_html/alphaweb'
run(f"cd {remote_root} && (nohup env NODE_OPTIONS='--max-old-space-size=2048' npm run dev > dev.log 2>&1 &)")

print("--- waiting for port 3000 ---")
for i in range(15):
    time.sleep(10)
    out, _ = run("netstat -tulpn | grep :3000")
    if ":3000" in out:
        print("--- UP on 3000! ---")
        print(out)
        break
    else:
        print(f"Still waiting ({i+1}/15)...")
        # Check if it started on another port by mistake
        out2, _ = run("netstat -tulpn | grep node")
        if out2:
            print("Processes found but not on 3000:")
            print(out2)

client.close()
