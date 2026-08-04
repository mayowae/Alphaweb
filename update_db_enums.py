import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run_sql(sql):
    cmd = f'cd /tmp && sudo -u postgres psql -d alphacollect_db -c "{sql}"'
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8').strip()
    err = stderr.read().decode('utf-8').strip()
    return out, err

# Add Closed status to investment_applications status enum
out, err = run_sql("ALTER TYPE enum_investment_applications_status ADD VALUE IF NOT EXISTS 'Closed';")
print("Alter enum_investment_applications_status:", out or err)

client.close()
