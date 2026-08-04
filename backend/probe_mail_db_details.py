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

print("=== Checking mail directory subfolders ===")
out, err = run("ls -la /home/mayowae/mail")
print(out)

print("=== Checking sizes of mail domains ===")
out, err = run("du -sh /home/mayowae/mail/* 2>/dev/null")
print(out)

print("=== Checking DB size and table counts ===")
db_cmd = "PGPASSWORD='AlphaW3b@Local2024' psql -h 127.0.0.1 -U alpha_admin -d alphacollect_db -c \"SELECT pg_size_pretty(pg_database_size('alphacollect_db'));\""
out, err = run(db_cmd)
print("DB Size:")
print(out)

db_tables_cmd = "PGPASSWORD='AlphaW3b@Local2024' psql -h 127.0.0.1 -U alpha_admin -d alphacollect_db -c \"SELECT table_name FROM information_schema.tables WHERE table_schema='public';\""
out, err = run(db_tables_cmd)
print("Tables:")
print(out)

client.close()
