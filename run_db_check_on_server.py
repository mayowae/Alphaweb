import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

sftp = client.open_sftp()
local_path = r'c:\Users\trade\Documents\Alphaweb-main\check_db_data.js'
remote_path = '/root/check_db_data.js'
sftp.put(local_path, remote_path)
sftp.close()

project_dir = "/home/mayowae/public_html/alphaweb"
# Need to run it from project dir so imports work, or use absolute paths in the script
# Modified script to use project dir
run_cmd = f"cd {project_dir} && node /root/check_db_data.js"
stdin, stdout, stderr = client.exec_command(run_cmd)

print("Output:")
print(stdout.read().decode('utf-8'))
print("Errors:")
print(stderr.read().decode('utf-8'))

client.close()
