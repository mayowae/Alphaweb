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
        "pm2 logs --lines 50 --no-colors",
        "journalctl -u nginx --no-pager -n 50",
        "tail -n 50 /var/log/nginx/error.log"
    ])
    with open("vps_logs_check.txt", "w", encoding="utf-8") as f:
        f.write(output)
    print("Saved to vps_logs_check.txt")
