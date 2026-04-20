import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('backfill_output.txt', 'w', encoding='utf-8')

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

def p(msg):
    log.write(str(msg) + '\n')
    log.flush()

# Backfill trial dates - use heredoc to avoid quoting issues
backfill_cmd = """PGPASSWORD='AlphaWeb2026!' psql -h localhost -U alpha_admin -d alphacollect_db << 'EOF'
UPDATE merchants 
SET trial_end_date = "createdAt" + INTERVAL '3 months',
    next_billing_date = "createdAt" + INTERVAL '3 months'
WHERE trial_end_date IS NULL AND next_billing_date IS NULL;
EOF"""

p("=== Backfilling trial dates ===")
out = run(backfill_cmd)
p(out)

# Verify results
verify_cmd = """PGPASSWORD='AlphaWeb2026!' psql -h localhost -U alpha_admin -d alphacollect_db << 'EOF'
SELECT id, email, subscription_status,
       trial_end_date::date AS trial_ends,
       next_billing_date::date AS next_bill,
       "createdAt"::date AS joined
FROM merchants 
ORDER BY id DESC 
LIMIT 10;
EOF"""

p("\n=== Merchants after backfill ===")
out = run(verify_cmd)
p(out)

# Check cron is running in backend
p("\n=== Check cron scheduled ===")
out = run("grep -n 'CRON\\|node-cron\\|runBilling' /home/mayowae/public_html/alphaweb/backend/server.js | head -10")
p(out)

out = run("tail -n 5 /home/mayowae/public_html/alphaweb/logs/backend-out-0.log")
p("Backend log tail:\n" + out)

log.close()
print("Done - see backfill_output.txt")
client.close()
