import paramiko
import sys

def execute_cmd(cmd):
    hostname = '159.198.36.24'
    port = 22
    username = 'root'
    password = '96eUC4aTbMu1o3yAP2'

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(hostname, port=port, username=username, password=password, timeout=30)
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='replace')
        err = stderr.read().decode('utf-8', errors='replace')
        client.close()
        return out, err
    except Exception as e:
        return "", str(e)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python run_live_command.py <command>")
        sys.exit(1)
    
    cmd = " ".join(sys.argv[1:])
    print(f"Executing: {cmd}")
    out, err = execute_cmd(cmd)
    if out:
        print("=== stdout ===")
        print(out)
    if err:
        print("=== stderr ===")
        print(err)
