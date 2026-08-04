import paramiko

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOSTNAME, port=22, username=USERNAME, password=PASSWORD)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

def safe_print(*args):
    import sys
    text = " ".join(str(a) for a in args)
    encoded = text.encode(sys.stdout.encoding or 'utf-8', errors='replace')
    sys.stdout.buffer.write(encoded + b'\n')

def run_and_print(cmd):
    safe_print(f"--- Running: {cmd} ---")
    out, err = run(cmd)
    if out.strip():
        safe_print("STDOUT:")
        safe_print(out)
    if err.strip():
        safe_print("STDERR:")
        safe_print(err)

safe_print("=== Checking DNS for paxalphaltd.com ===")
run_and_print("host paxalphaltd.com")
run_and_print("host www.paxalphaltd.com")
run_and_print("host mail.paxalphaltd.com")

safe_print("\n=== Reading last 50 lines of lets_encrypt.log ===")
run_and_print("tail -n 50 /var/webuzo/logs/lets_encrypt.log")

safe_print("\n=== Reading last 50 lines of acme.log ===")
run_and_print("tail -n 50 /home/mayowae/.acme.sh/acme.log")

client.close()
