import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('deploy_billing.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

BASE = '/home/mayowae/public_html/alphaweb'
sftp = client.open_sftp()

# ─────────────────────────────────────────────────────────────────
# 1. Deploy billingService v2
# ─────────────────────────────────────────────────────────────────
p("=== 1. Deploy billingService_v2 ===")
sftp.put(
    r'C:\Users\trade\Documents\Alphaweb-main\local_edit\billingService_v2.js',
    f'{BASE}/backend/services/billingService.js'
)
p("OK: billingService.js deployed")

# ─────────────────────────────────────────────────────────────────
# 2. Patch agentController: hook updateMerchantPlan after agent create
# ─────────────────────────────────────────────────────────────────
p("\n=== 2. Patch agentController.js ===")
with sftp.open(f'{BASE}/backend/controllers/agentController.js', 'r') as f:
    ac = f.read().decode('utf-8')

# Add import at top if not present
billing_import = "const { updateMerchantPlan } = require('../services/billingService');\n"
if 'updateMerchantPlan' not in ac:
    ac = billing_import + ac
    p("Added import for updateMerchantPlan")
else:
    p("Import already present")

# Hook after Agent.create success response - add plan update call
old_agent_resp = "    res.status(201).json({\n      success: true,\n      message: 'Agent registered successfully',"
new_agent_resp = "    // Recalculate merchant plan based on new agent count\n    updateMerchantPlan(merchantId).catch(e => console.error('[Billing] plan update error:', e.message));\n\n    res.status(201).json({\n      success: true,\n      message: 'Agent registered successfully',"

if 'updateMerchantPlan(merchantId)' not in ac:
    ac = ac.replace(old_agent_resp, new_agent_resp)
    p("Hooked updateMerchantPlan after agent create")
else:
    p("Hook already present")

with sftp.open(f'{BASE}/backend/controllers/agentController.js', 'w') as f:
    f.write(ac.encode('utf-8'))

# ─────────────────────────────────────────────────────────────────
# 3. Fix authController: add planId=1 on signup
# ─────────────────────────────────────────────────────────────────
p("\n=== 3. Fix authController signup - add planId=1 ===")
with sftp.open(f'{BASE}/backend/controllers/authController.js', 'r') as f:
    ac2 = f.read().decode('utf-8')

old_signup = "      trialEndDate: trialEndDate,\n      nextBillingDate: trialEndDate, // first charge is at end of trial\n      subscriptionStatus: 'Active',"
new_signup  = "      planId: 1,                      // default: Starter Pack\n      trialEndDate: trialEndDate,\n      nextBillingDate: trialEndDate, // first charge is at end of trial\n      subscriptionStatus: 'Active',"

if 'planId: 1,' not in ac2:
    ac2 = ac2.replace(old_signup, new_signup)
    p("Added planId=1 to Merchant.create")
else:
    p("planId=1 already present")

with sftp.open(f'{BASE}/backend/controllers/authController.js', 'w') as f:
    f.write(ac2.encode('utf-8'))

# ─────────────────────────────────────────────────────────────────
# 4. Fix merchantManagementController: return full billing data for Subscriptions tab
# ─────────────────────────────────────────────────────────────────
p("\n=== 4. Update getMerchantSubscriptions in merchantManagementController ===")
with sftp.open(f'{BASE}/backend/controllers/merchantManagementController.js', 'r') as f:
    mmc = f.read().decode('utf-8')

# Check what getMerchantSubscriptions currently returns
sub_idx = mmc.find('getMerchantSubscriptions')
p(f"Found getMerchantSubscriptions at index {sub_idx}")
p("Current function snippet:\n" + mmc[sub_idx:sub_idx+400])

# ─────────────────────────────────────────────────────────────────
# 5. Deploy Subscriptions&Billings tsx component (admin tab)
# ─────────────────────────────────────────────────────────────────
p("\n=== 5. Deploy Subscriptions&Billings admin tab ===")
# Create dir if needed
run(f"mkdir -p '{BASE}/src/components/tables/merchants/merchantdetailstabs'")
sftp.put(
    r'C:\Users\trade\Documents\Alphaweb-main\local_edit\SubscriptionsBillings.tsx',
    f'{BASE}/src/components/tables/merchants/merchantdetailstabs/Subscriptions&Billings.tsx'
)
p("OK: Subscriptions&Billings.tsx deployed")

# ─────────────────────────────────────────────────────────────────
# 6. Fix getMerchantSubscriptions to return rich data from DB
# ─────────────────────────────────────────────────────────────────
p("\n=== 6. Fix getMerchantSubscriptions controller function ===")

new_get_subs_fn = '''// Get merchant subscriptions (full billing data for admin tab)
const getMerchantSubscriptions = async (req, res) => {
  try {
    const { id } = req.params;
    const { Merchant, Agent, Plan, Subscription } = require('../models');
    const { Op } = require('sequelize');

    const merchant = await Merchant.findByPk(id, {
      attributes: ['id','businessName','email','subscriptionStatus','planId',
                   'nextBillingDate','totalDebt','trialEndDate','isCustomFee','customFee'],
      include: [
        { model: Plan, as: 'plan' },
        { model: Agent, as: 'agents', attributes: ['id'] }
      ]
    });

    if (!merchant) return res.status(404).json({ success: false, message: 'Merchant not found' });

    const history = await Subscription.findAll({
      where: { merchantId: id },
      include: [{ model: Plan, as: 'plan' }],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    res.json({
      success: true,
      data: {
        status: merchant.subscriptionStatus,
        planId: merchant.planId,
        planName: merchant.plan ? merchant.plan.name : 'Starter Pack',
        nextBillingDate: merchant.nextBillingDate,
        totalDebt: merchant.totalDebt,
        trialEndDate: merchant.trialEndDate,
        isCustomFee: merchant.isCustomFee,
        customFee: merchant.customFee,
        agentCount: merchant.agents ? merchant.agents.length : 0,
        history
      }
    });
  } catch (error) {
    console.error('Error fetching merchant subscriptions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch merchant subscriptions', error: error.message });
  }
};
'''

# Replace old getMerchantSubscriptions
import re
# Find start of the existing function
old_fn_match = re.search(r'// Get merchant subscriptions\r?\n.*?getMerchantSubscriptions.*?\n.*?\};', mmc, re.DOTALL)
if old_fn_match:
    mmc = mmc[:old_fn_match.start()] + new_get_subs_fn + '\n' + mmc[old_fn_match.end():]
    p("Replaced getMerchantSubscriptions function")
else:
    # If not found, check exports and add before module.exports
    if 'getMerchantSubscriptions' in mmc:
        # Function exists with different comment - try to find it by function name
        fn_match = re.search(r'const getMerchantSubscriptions = async.*?\n\};', mmc, re.DOTALL)
        if fn_match:
            mmc = mmc[:fn_match.start()] + new_get_subs_fn.strip() + mmc[fn_match.end():]
            p("Replaced getMerchantSubscriptions (alternative match)")
        else:
            p("WARNING: Could not replace - function pattern not matched")
    else:
        # Add before module.exports
        mmc = mmc.replace('module.exports', new_get_subs_fn + '\nmodule.exports')
        p("Added getMerchantSubscriptions before module.exports")

# Make sure it's in exports
if 'getMerchantSubscriptions' not in mmc.split('module.exports')[-1]:
    mmc = mmc.replace('module.exports = {', 'module.exports = {\n  getMerchantSubscriptions,')
    p("Added getMerchantSubscriptions to exports")

with sftp.open(f'{BASE}/backend/controllers/merchantManagementController.js', 'w') as f:
    f.write(mmc.encode('utf-8'))
p("merchantManagementController.js saved")

# ─────────────────────────────────────────────────────────────────
# 7. Backfill planId=1 for existing merchants
# ─────────────────────────────────────────────────────────────────
p("\n=== 7. Backfill planId=1 for existing merchants ===")
out = run("""PGPASSWORD='AlphaWeb2026!' psql -h localhost -U alpha_admin -d alphacollect_db << 'EOF'
UPDATE merchants SET plan_id = 1 WHERE plan_id IS NULL;
EOF""")
p(out)

sftp.close()

# ─────────────────────────────────────────────────────────────────
# 8. Restart backend
# ─────────────────────────────────────────────────────────────────
p("\n=== 8. Restart backend ===")
run("pm2 restart alphaweb-backend")
time.sleep(6)
out = run("tail -n 5 /home/mayowae/public_html/alphaweb/logs/backend-out-0.log")
p("Backend log:\n" + out)

# ─────────────────────────────────────────────────────────────────
# 9. Trigger build
# ─────────────────────────────────────────────────────────────────
p("\n=== 9. Triggering frontend build ===")
client.exec_command(f'cd {BASE} && npm run build > build_billing.log 2>&1')
p("Build started. Run check_build.py in ~2 minutes.")

log.close()
print("Done - see deploy_billing.txt")
client.close()
