import paramiko
import time

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('fix_mmc_output.txt', 'w', encoding='utf-8')
def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')
def p(msg): log.write(str(msg) + '\n'); log.flush()

BASE = '/home/mayowae/public_html/alphaweb'
sftp = client.open_sftp()

# Read the full file
with sftp.open(f'{BASE}/backend/controllers/merchantManagementController.js', 'r') as f:
    mmc = f.read().decode('utf-8')

# The orphaned block is the old function tail that was left behind.
# It starts right after the new getMerchantSubscriptions function ends with '};'
# and appears as: blank lines + '    res.json({' ... '  }\r\n};\r\n'
# 
# Pattern: the old tail starts after new function's closing "};\n\n"
# and contains "    res.json({\n      success: true,\n      data: subscriptionData,"

orphan = (
    "\r\n\r\n\r\n    res.json({\r\n"
    "      success: true,\r\n"
    "      data: subscriptionData,\r\n"
    "    });\r\n"
    "  } catch (error) {\r\n"
    "    console.error('Error fetching merchant subscriptions:', error);\r\n"
    "    res.status(500).json({\r\n"
    "      success: false,\r\n"
    "      message: 'Failed to fetch merchant subscriptions',\r\n"
    "      error: error.message,\r\n"
    "    });\r\n"
    "  }\r\n"
    "};\r\n"
)

if orphan in mmc:
    mmc = mmc.replace(orphan, "\r\n")
    p("SUCCESS: Removed orphaned old function tail")
else:
    p("Exact orphan not found, trying alternative...")
    # Try to find it with slightly different line endings
    import re
    pattern = r'\n\n\n\s+res\.json\(\{\s*\n\s+success: true,\s*\n\s+data: subscriptionData,\s*\n\s+\}\);\s*\n\s+\} catch \(error\) \{[^}]+\}\s*\n\};\s*\n'
    match = re.search(pattern, mmc)
    if match:
        mmc = mmc[:match.start()] + "\n" + mmc[match.end():]
        p(f"SUCCESS: Removed orphan via regex at position {match.start()}")
    else:
        # Last resort: just delete lines 282-296
        lines = mmc.split('\n')
        p(f"Lines around issue:")
        p('\n'.join(f"{i+1}: {lines[i]}" for i in range(278, min(300, len(lines)))))
        # Remove the orphaned lines (0-indexed: lines 281-295)
        del lines[281:296]
        mmc = '\n'.join(lines)
        p("Removed lines 282-296 (0-indexed 281-295)")

# Write fixed file
with sftp.open(f'{BASE}/backend/controllers/merchantManagementController.js', 'w') as f:
    f.write(mmc.encode('utf-8'))
p("File written")

sftp.close()

# Verify syntax
out = run(f"node --check {BASE}/backend/controllers/merchantManagementController.js 2>&1")
p("Syntax check: " + (out.strip() if out.strip() else "PASSED - no errors"))

# Also check and fix the merchant model - still using underscored names in queries
# The backend error shows: column "subscriptionStatus" does not exist
# This means the merchant model on the server doesn't have field mappings
# Let's check it and fix
p("\n=== Current merchant model subscription fields ===")
out = run(f"grep -n 'subscription\\|planId\\|plan_id\\|nextBilling\\|totalDebt\\|trialEnd\\|isCustom\\|customFee' {BASE}/backend/models/merchant.js | head -20")
p(out)

log.close()
print("Done - see fix_mmc_output.txt")
client.close()
