import paramiko
import sys

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

def run_query(query):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port, username, password)
    
    psql_cmd = f'psql "postgresql://alpha_admin:AlphaWeb2026!@localhost:5432/alphacollect_db" -c "{query}"'
    stdin, stdout, stderr = ssh.exec_command(psql_cmd)
    
    out = stdout.read().decode('utf-8')
    err = stderr.read().decode('utf-8')
    ssh.close()
    return out, err

out, err = run_query(sys.argv[1])
print(out)
if err: print("Error:", err)
