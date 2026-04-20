import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

try:
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(hostname, port=port, username=username, password=password)

    stdin, stdout, stderr = client.exec_command('tail -n 200 /home/mayowae/public_html/alphaweb/dev.log')
    content = stdout.read().decode('utf-8', errors='replace')
    
    with open('remote_log.log', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Log saved to remote_log.log")
    client.close()
except Exception as e:
    print(f"Error: {e}")
