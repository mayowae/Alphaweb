import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

# Step 1: Upload the correct model
sftp = client.open_sftp()
sftp.put(
    r'C:\Users\trade\Documents\Alphaweb-main\local_edit\merchant_model_fixed.js',
    '/home/mayowae/public_html/alphaweb/backend/models/merchant.js'
)
sftp.close()
print("Step 1: Uploaded fixed merchant model (underscored:false + field mappings)")

# Step 2: Verify file content (check it has field: 'subscription_status')
out = run("grep 'subscription_status\\|underscored\\|field.*plan_id' /home/mayowae/public_html/alphaweb/backend/models/merchant.js")
print("Step 2: Verify field mappings in uploaded file:\n", out)

# Step 3: Hard restart backend (stop + start, not just restart to clear require cache)
run("pm2 stop alphaweb-backend")
time.sleep(2)
run("pm2 start alphaweb-backend")
print("Step 3: Backend hard-restarted")
time.sleep(5)

# Step 4: Test login
out = run("""curl -s -X POST http://127.0.0.1:5000/merchant/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"mayowae@msn.com","password":"wrongpassword"}'""")
print("Step 4: Login test (wrong password expected 'Invalid credentials'):\n", out[:300])

# Step 5: Check recent backend error log
out = run("tail -n 30 /home/mayowae/public_html/alphaweb/backend/logs/backend-error-0.log 2>/dev/null || tail -n 30 /home/mayowae/public_html/alphaweb/logs/backend-error-0.log")
print("Step 5: Recent backend errors:\n", out[:1000])

client.close()
