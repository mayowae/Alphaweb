import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

def verify():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, port, username, password)
        
        print("Checking Backend Controller...")
        stdin, stdout, stderr = ssh.exec_command('grep -n "whereClause.packageCategory" /home/mayowae/public_html/alphaweb/backend/controllers/packageController.js')
        print(stdout.read().decode())
        
        print("Checking Frontend Collection Page...")
        stdin, stdout, stderr = ssh.exec_command('grep -n "isCollectionType" /home/mayowae/public_html/alphaweb/src/app/dashboard/(pages)/package/(pages)/collection/page.tsx')
        print(stdout.read().decode())
        
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify()
