import paramiko

def run_remote(hostname, port, username, password, commands):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port=port, username=username, password=password)
    all_out = []
    for cmd in commands:
        all_out.append(f"--- {cmd} ---")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        all_out.append(stdout.read().decode())
        all_out.append(stderr.read().decode())
    ssh.close()
    return "\n".join(all_out)

if __name__ == "__main__":
    hostname = '159.198.36.24'
    port = 22
    username = 'root'
    password = '96eUC4aTbMu1o3yAP2'
    output = run_remote(hostname, port, username, password, [
        "dig alphakolect.com",
        "dig NS alphakolect.com",
        "whois alphakolect.com | grep 'Name Server'",
        "ping -c 1 8.8.8.8"
    ])
    with open("vps_dns_check.txt", "w", encoding="utf-8") as f:
        f.write(output)
    print("Saved to vps_dns_check.txt")
