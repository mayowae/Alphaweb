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

path = '/home/mayowae/public_html/alphaweb/backend/models/merchant.js'
content = run(f"cat {path}")

# Add debug log
if 'console.log("MARKER:' not in content:
    new_content = content.replace("const Merchant = sequelize.define", 'console.log("MARKER: Loading Merchant Model"); const Merchant = sequelize.define')
    
    with open("merchant_debug.js", "w", encoding="utf-8") as f:
        f.write(new_content)
    
    sftp = client.open_sftp()
    sftp.put("merchant_debug.js", path)
    sftp.close()
    print("Debug added to merchant.js")

client.close()
