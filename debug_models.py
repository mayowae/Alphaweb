import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8')

index_path = '/home/mayowae/public_html/alphaweb/backend/models/index.js'
content = run(f'cat {index_path}')

# Add debug logging
debug_log = """
// DEBUG LOGGING
Object.keys(db).forEach(modelName => {
  if (db[modelName] === undefined) {
    console.log(`[DEBUG] Model ${modelName} is UNDEFINED`);
  }
});
console.log(`[DEBUG] db.Subscription type: ${typeof db.Subscription}`);
"""

if '// DEBUG LOGGING' not in content:
    insertion_point = "Object.keys(db).forEach(modelName => {"
    updated_content = content.replace(insertion_point, debug_log + insertion_point)
    
    with open('debug_index.js', 'w', encoding='utf-8') as f:
        f.write(updated_content)
        
    sftp = client.open_sftp()
    sftp.put('debug_index.js', index_path)
    sftp.close()
    print("Added debug logging to models/index.js")

# Restart backend
run('pm2 restart alphaweb-backend')
time_sleep = 5
import time
time.sleep(time_sleep)

print("\n--- DEBUG LOGS ---")
stdin, stdout, stderr = client.exec_command('tail -n 50 /root/.pm2/logs/alphaweb-backend-out.log')
print(stdout.read().decode('utf-8', errors='replace'))

client.close()
os.remove('debug_index.js')
