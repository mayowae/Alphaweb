import paramiko

def check_server():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('159.198.36.24', port=22, username='root', password='96eUC4aTbMu1o3yAP2')
    
    with open('server_check.txt', 'w', encoding='utf-8') as f:
        stdin, stdout, stderr = ssh.exec_command('cat /home/mayowae/public_html/alphaweb/dev.log')
        f.write("=== DEV.LOG ===\n")
        f.write(stdout.read().decode('utf-8', errors='replace'))
        
    ssh.close()
    print("Check complete. Read server_check.txt")

if __name__ == "__main__":
    check_server()
