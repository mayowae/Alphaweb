import paramiko

def run_remote_diag(hostname, port, username, password):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        ssh.connect(hostname, port=port, username=username, password=password)
        
        commands = {
            "PM2 Status": "pm2 list",
            "Nginx Error Log": "tail -n 20 /var/log/nginx/error.log",
            "Next.js Process": "netstat -tulpn | grep 3000",
            "Next.js Logs": "tail -n 50 /home/mayowae/public_html/alphaweb/dev.log"
        }
        
        with open("diag_results.txt", "w", encoding="utf-8") as f:
            for name, cmd in commands.items():
                f.write(f"=== {name} ===\n")
                stdin, stdout, stderr = ssh.exec_command(cmd)
                out = stdout.read().decode('utf-8', errors='replace')
                err = stderr.read().decode('utf-8', errors='replace')
                if out:
                    f.write(out + "\n")
                if err:
                    f.write(f"ERROR: {err}\n")
                f.write("\n")
            
    except Exception as e:
        with open("diag_results.txt", "w", encoding="utf-8") as f:
            f.write(f"Connection failed: {e}\n")
    finally:
        ssh.close()

if __name__ == "__main__":
    run_remote_diag('159.198.36.24', 22, 'root', '96eUC4aTbMu1o3yAP2')
