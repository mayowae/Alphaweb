import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

stdin, stdout, stderr = client.exec_command(
    'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/dashboard/subscription'
)
print('HTTP Status:', stdout.read().decode())

stdin2, stdout2, stderr2 = client.exec_command(
    'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/api/merchant/subscription'
)
print('API Status:', stdout2.read().decode())

client.close()
