import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

path = '/home/mayowae/public_html/alphaweb'
stdin, stdout, stderr = client.exec_command(f'cd {path} && npm run start', get_pty=True)

# Read output with timeout
with open("fe_start_output.txt", "w", encoding="utf-8") as out_f:
    import time
    start = time.time()
    while time.time() - start < 30:
        if stdout.channel.recv_ready():
            out_f.write(stdout.channel.recv(1024).decode('utf-8', errors='replace'))
        time.sleep(0.1)

client.close()
