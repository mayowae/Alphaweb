import paramiko
import sys
import io

def restart_and_fix():
    host = "159.198.36.24"
    port = 22
    username = "root"
    password = "Gn7w7GrWz31Z1q2gBF"

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        client.connect(hostname=host, port=port, username=username, password=password)

        commands_to_run = [
            "systemctl stop httpd",
            "systemctl stop apache2",
            "systemctl restart nginx",
            "systemctl status nginx --no-pager"
        ]

        with io.open("results.txt", "w", encoding="utf-8") as f:
            for cmd in commands_to_run:
                f.write(f"--- Running command: {cmd} ---\n")
                stdin, stdout, stderr = client.exec_command(cmd)
                stdout_str = stdout.read().decode('utf-8', errors='replace')
                stderr_str = stderr.read().decode('utf-8', errors='replace')
                
                if stdout_str:
                    f.write(f"Output:\n{stdout_str}\n")
                if stderr_str:
                    f.write(f"Error:\n{stderr_str}\n")
                    
    except Exception as e:
        sys.exit(1)
    finally:
        client.close()

if __name__ == "__main__":
    restart_and_fix()
