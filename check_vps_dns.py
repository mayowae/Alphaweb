import paramiko

def run_remote(hostname, port, username, password, commands):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port=port, username=username, password=password)
    for cmd in commands:
        print(f"--- {cmd} ---")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        print(stdout.read().decode())
        print(stderr.read().decode())
    ssh.close()

if __name__ == "__main__":
    hostname = '159.198.36.24'
    port = 22
    username = 'root'
    password = '96eUC4aTbMu1o3yAP2'
    run_remote(hostname, port, username, password, [
        "dig alphakolect.com",
        "dig NS alphakolect.com",
        "whois alphakolect.com | grep 'Name Server'",
        "ping -c 1 google.com"
    ])
