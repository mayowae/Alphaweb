import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

path = '/home/mayowae/public_html/alphaweb'
stdin, stdout, stderr = client.exec_command('pm2 show alphaweb-frontend')

with open("pm2_show.txt", "w", encoding="utf-8") as f:
    f.write(stdout.read().decode('utf-8', errors='replace'))

client.close()
