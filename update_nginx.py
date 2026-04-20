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
    return stdout.read().decode('utf-8', errors='replace'), stderr.read().decode('utf-8')

# Download remote nginx conf
nginx_conf, _ = run("cat /etc/nginx/conf.d/alphaweb.conf")

# Replace "collaborator|" from the first block
nginx_conf = nginx_conf.replace("merchant|collaborator|superadmin", "merchant|superadmin")

# Add "collaborator" to the clashing block
nginx_conf = nginx_conf.replace("agents|customers|dashboard", "agents|customers|dashboard|collaborator")

with open('alphaweb.conf.new', 'w', encoding='utf-8') as f:
    f.write(nginx_conf)

# Upload the new conf
sftp = client.open_sftp()
sftp.put('alphaweb.conf.new', '/etc/nginx/conf.d/alphaweb.conf')
sftp.close()

# Reload nginx
out, err = run("systemctl reload nginx")
print("Reload nginx out:", out)
print("Reload nginx err:", err)

client.close()
