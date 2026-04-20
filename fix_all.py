import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('fix_all_output.txt', 'w', encoding='utf-8')

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

def p(msg):
    log.write(str(msg) + '\n')
    log.flush()

BASE = '/home/mayowae/public_html/alphaweb/backend'

# -----------------------------------------------------------------------
# FIX 1: authController.js — change Merchant.create to use JS property names
# (camelCase) since Sequelize model maps them to snake_case DB columns
# -----------------------------------------------------------------------
p("=== Fix 1: Fix Merchant.create field names in authController.js ===")
sftp = client.open_sftp()

with sftp.open(f'{BASE}/controllers/authController.js', 'r') as f:
    auth_content = f.read().decode('utf-8')

old_create = """      trial_end_date: trialEndDate,
      next_billing_date: trialEndDate, // first charge is at end of trial
      subscription_status: 'Active',"""

new_create = """      trialEndDate: trialEndDate,
      nextBillingDate: trialEndDate, // first charge is at end of trial
      subscriptionStatus: 'Active',"""

if old_create in auth_content:
    auth_content = auth_content.replace(old_create, new_create)
    with sftp.open(f'{BASE}/controllers/authController.js', 'w') as f:
        f.write(auth_content.encode('utf-8'))
    p("SUCCESS: Fixed Merchant.create to use camelCase property names")
else:
    p("WARNING: Old create block not found - checking what's there:")
    idx = auth_content.find('trial_end_date: trialEndDate')
    if idx >= 0:
        p(auth_content[idx-50:idx+200])
    else:
        p("trial_end_date not found in authController at all")

# -----------------------------------------------------------------------
# FIX 2: Update existing merchants who have NULL trial dates (backfill)
# Set trial_end_date = createdAt + 3 months for all merchants with no trial set
# -----------------------------------------------------------------------
p("\n=== Fix 2: Backfill trial dates for existing merchants ===")
backfill_sql = """
UPDATE merchants 
SET trial_end_date = \"createdAt\" + INTERVAL '3 months',
    next_billing_date = \"createdAt\" + INTERVAL '3 months'
WHERE trial_end_date IS NULL AND next_billing_date IS NULL;
"""
out = run(f"PGPASSWORD='AlphaWeb2026!' psql -h localhost -U alpha_admin -d alphacollect_db -c \"{backfill_sql.strip()}\"")
p(out)

# Verify
out = run("""PGPASSWORD='AlphaWeb2026!' psql -h localhost -U alpha_admin -d alphacollect_db -c \
  'SELECT id, email, subscription_status, trial_end_date, next_billing_date FROM merchants ORDER BY id DESC LIMIT 5;'""")
p("Merchants after backfill:\n" + out)

# -----------------------------------------------------------------------
# FIX 3: Add node-cron billing schedule to server.js
# -----------------------------------------------------------------------
p("\n=== Fix 3: Add billing cron to server.js ===")

with sftp.open(f'{BASE}/server.js', 'r') as f:
    server_content = f.read().decode('utf-8')

cron_snippet = """
// ============================================================
// Billing Cron Job - runs daily at 02:00 AM
// ============================================================
const cron = require('node-cron');
const { runBillingCycle } = require('./services/billingService');

cron.schedule('0 2 * * *', async () => {
  console.log('[CRON] Running daily billing cycle...');
  try {
    await runBillingCycle();
  } catch (err) {
    console.error('[CRON] Billing cycle error:', err);
  }
}, {
  scheduled: true,
  timezone: 'Africa/Lagos'
});

console.log('[CRON] Billing cron job scheduled (daily at 02:00 WAT)');
"""

if 'node-cron' in server_content or 'runBillingCycle' in server_content:
    p("Cron already exists in server.js - skipping")
else:
    # Add before the last line (module.exports or app.listen)
    # Find a good insertion point - after all routes
    if 'app.listen' in server_content:
        insert_before = server_content.rfind('app.listen')
        new_server = server_content[:insert_before] + cron_snippet + '\n' + server_content[insert_before:]
    else:
        new_server = server_content + cron_snippet

    with sftp.open(f'{BASE}/server.js', 'w') as f:
        f.write(new_server.encode('utf-8'))
    p("SUCCESS: Added daily billing cron to server.js")

sftp.close()

# Restart backend
run("pm2 restart alphaweb-backend")
p("\nBackend restarted.")

import time
time.sleep(6)

# Verify backend started OK
out = run(f"tail -n 10 {BASE.replace('/backend','')}/logs/backend-out-0.log")
p("Backend out log:\n" + out)

log.close()
print("Done - see fix_all_output.txt")
client.close()
