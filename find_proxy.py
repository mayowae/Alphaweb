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

print("--- finding proxy pass for 5000 ---")
print(run("grep -rnE 'localhost:5000|127.0.0.1:5000' /etc/nginx /etc/apache2 /usr/local/apache/conf 2>/dev/null"))

print("--- finding proxy pass for 3000 ---")
print(run("grep -rnE 'localhost:3000|127.0.0.1:3000' /etc/nginx /etc/apache2 /usr/local/apache/conf 2>/dev/null"))

client.close()
