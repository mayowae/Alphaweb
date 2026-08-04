import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run_psql(db, sql):
    cmd = f'sudo -u postgres psql -d {db} -c "{sql}"'
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8')

# Check multiple tables
tables = ['subscriptions', 'faqs', 'plans', 'admin_logs']
for table in tables:
    print(f"--- Columns for {table} ---")
    sql = f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}' ORDER BY ordinal_position;"
    print(run_psql('alphacollect_db', sql))

client.close()
