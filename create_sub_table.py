import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('create_table_output.txt', 'w', encoding='utf-8')

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

def p(msg):
    log.write(str(msg) + '\n')
    log.flush()

# Create the subscriptions table matching the Sequelize model definition
create_sql = """
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES plans(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','Paid','Overdue','Cancelled')),
    period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    payment_date TIMESTAMP WITH TIME ZONE,
    invoice_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
"""

p("=== Creating subscriptions table ===")
out = run(f"PGPASSWORD='AlphaWeb2026!' psql -h localhost -U alpha_admin -d alphacollect_db -c \"{create_sql.strip()}\"")
p(out)

# Verify it was created
p("\n=== Verify table exists ===")
out = run("PGPASSWORD='AlphaWeb2026!' psql -h localhost -U alpha_admin -d alphacollect_db -t -c \"SELECT tablename FROM pg_tables WHERE tablename='subscriptions';\"")
p(out)

# Also restart backend so it picks up the new table
run("pm2 restart alphaweb-backend")
p("\nBackend restarted.")

import time
time.sleep(5)

# Test the full subscription API
test_token = run("node -e \"const jwt = require('/home/mayowae/public_html/alphaweb/backend/node_modules/jsonwebtoken'); const token = jwt.sign({id:5,type:'merchant',email:'mayowae@msn.com'}, '9fA2KqLxP7D4RZcM8wE5NHyUeJbS6TQ0mV1aXoC3rIYFgWUp'); console.log(token);\"").strip()
p("\n=== Full subscription API response ===")
out = run(f"curl -s http://127.0.0.1:5000/api/merchant/subscription -H 'Authorization: Bearer {test_token}'")
p(out[:2000])

log.close()
print("Done - see create_table_output.txt")
client.close()
