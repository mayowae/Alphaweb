import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('check_db_tables.txt', 'w', encoding='utf-8')

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

def p(msg):
    log.write(str(msg) + '\n')
    log.flush()

# Check if subscriptions table exists in the DB
p("=== Tables in database ===")
out = run("PGPASSWORD='AlphaWeb2026!' psql -h localhost -U alpha_admin -d alphacollect_db -t -c \"SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;\"")
p(out)

log.close()
print("Done - see check_db_tables.txt")
client.close()
