import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('audit_billing.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

BASE = '/home/mayowae/public_html/alphaweb/backend'

# 1. Plans table
p("=== Plans in DB ===")
out = run("PGPASSWORD='AlphaWeb2026!' psql -h localhost -U alpha_admin -d alphacollect_db << 'EOF'\nSELECT id, name, pricing, max_agents FROM plans ORDER BY id;\nEOF")
p(out)

# 2. Merchant model - is_custom_fee, custom_fee, plan_id fields
p("\n=== Merchant model custom fee fields ===")
out = run(f"grep -n 'custom\\|planId\\|plan_id\\|is_custom' {BASE}/models/merchant.js")
p(out)

# 3. Admin merchant management controller - custom fee handling
p("\n=== merchantManagementController subscription/custom fee ===")
out = run(f"grep -n 'custom_fee\\|customFee\\|is_custom\\|subscription\\|plan' {BASE}/controllers/merchantManagementController.js | head -40")
p(out)

# 4. Does admin have a route to update merchant custom fee?
p("\n=== Admin routes for merchant update ===")
out = run(f"grep -n 'merchant.*update\\|update.*merchant\\|custom.*fee\\|customFee\\|subscription.*update' {BASE}/server.js | head -20")
p(out)

# 5. Check dashboard middleware / subscription gate
p("\n=== Middleware: subscription/access check ===")
out = run(f"grep -rn 'subscription_status\\|subscriptionStatus\\|Blocked\\|Grace\\|total_debt' {BASE}/middleware/ 2>/dev/null | head -20")
p(out if out.strip() else "(No subscription middleware found)")

# 6. Subscription page frontend shows invoice
p("\n=== Current subscription page ===")
out = run("head -30 '/home/mayowae/public_html/alphaweb/src/app/dashboard/(pages)/subscription/page.tsx'")
p(out)

# 7. Admin merchant detail page for custom fee toggle
p("\n=== Admin merchant detail page (for custom fee UI) ===")
out = run("find /home/mayowae/public_html/alphaweb/src -name '*.tsx' | xargs grep -l 'custom.*fee\\|customFee\\|is_custom' 2>/dev/null")
p(out if out.strip() else "(No frontend file found for custom fee)")

# 8. billingService - current state
p("\n=== billingService current state ===")
out = run(f"cat {BASE}/services/billingService.js")
p(out)

log.close()
print("Done - see audit_billing.txt")
client.close()
