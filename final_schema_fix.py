import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run_sql(sql):
    cmd = f'sudo -u postgres psql -d alphacollect_db -c "{sql}"'
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8').strip()
    err = stderr.read().decode('utf-8').strip()
    return out, err

print("=== Creating ENUMs and fixing columns ===\n")

# Create enum types if not exist
enums_sql = [
    ("enum_collections_source", "'Mobile', 'Web', 'API'"),
]

for enum_name, values in enums_sql:
    sql = f"SELECT 1 FROM pg_type WHERE typname = '{enum_name}';"
    out, _ = run_sql(sql)
    if '1' not in out:
        out, err = run_sql(f"CREATE TYPE {enum_name} AS ENUM ({values});")
        print(f"Created {enum_name}:", out or err)
    else:
        print(f"{enum_name} already exists")

# Now add the columns with the proper types
migrations = [
    # (table, column, type, default)
    ("collections", "source", "enum_collections_source", "'Web'"),
    ("remittances", "source", "enum_remittances_source", "'Web'"),
]

for table, col, col_type, default in migrations:
    # Check if column exists
    check_sql = f"SELECT 1 FROM information_schema.columns WHERE table_name='{table}' AND column_name='{col}';"
    out, _ = run_sql(check_sql)
    if '1' not in out:
        add_sql = f"ALTER TABLE {table} ADD COLUMN {col} {col_type} NOT NULL DEFAULT {default};"
        out, err = run_sql(add_sql)
        print(f"Add {col} to {table}:", out or err)
    else:
        print(f"{col} already exists in {table}")

print("\n=== Final verification ===")
for table in ['collections', 'remittances']:
    out, _ = run_sql(f"SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name='{table}' ORDER BY ordinal_position;")
    print(f"\n{table}:")
    print(out)

client.close()
