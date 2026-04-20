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
    return stdout.read().decode('utf-8', errors='replace'), stderr.read().decode('utf-8', errors='replace')

# Upload the fixed model
sftp = client.open_sftp()
sftp.put(
    r'C:\Users\trade\Documents\Alphaweb-main\local_edit\merchant_model_fixed.js',
    '/home/mayowae/public_html/alphaweb/backend/models/merchant.js'
)
sftp.close()
print("Uploaded fixed merchant model.")

# Restart backend
client.exec_command('pm2 restart alphaweb-backend')
print("Backend restarted.")

import time
time.sleep(5)

# Verify the model loaded correctly - test login
out, err = run("""curl -s -X POST http://127.0.0.1:5000/merchant/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"mayowae@msn.com","password":"test123"}'""")
print("Login test response:", out[:300])

client.close()
