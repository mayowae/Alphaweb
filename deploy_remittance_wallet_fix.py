import paramiko, sys, os

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'
PORT = 22

LOCAL_BASE = r'c:\Users\trade\Documents\Alphaweb-main'
REMOTE_BASE = '/home/mayowae/public_html/alphaweb'

FILES_TO_UPLOAD = [
    (
        os.path.join(LOCAL_BASE, 'backend', 'controllers', 'remittanceController.js'),
        f'{REMOTE_BASE}/backend/controllers/remittanceController.js'
    ),
]

def connect():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOSTNAME, port=PORT, username=USERNAME, password=PASSWORD, timeout=30)
    print("Connected OK")
    return client

def run(client, cmd, desc=''):
    print(f"\n>>> {desc or cmd[:80]}")
    _, stdout, stderr = client.exec_command(cmd, timeout=300)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    rc = stdout.channel.recv_exit_status()
    safe = lambda s: s.encode('ascii', errors='replace').decode('ascii')
    if out: print(safe(out)[-3000:])
    if err and rc != 0: print("STDERR:", safe(err)[-500:])
    return rc

if __name__ == '__main__':
    client = connect()
    sftp = client.open_sftp()

    print("\n=== Step 1: Uploading backend/controllers/remittanceController.js ===")
    for local, remote in FILES_TO_UPLOAD:
        print(f"  Uploading {os.path.basename(local)}...")
        sftp.put(local, remote)
        print("  OK")
    sftp.close()

    print("\n=== Step 2: Restarting backend ===")
    run(client, "pm2 restart alphaweb-backend 2>&1 | cat", "Restart backend")

    print("\n=== Step 3: Repairing customer wallet balances ===")
    repair_cmd = """node -e "
const { CustomerWallet, Remittance, ChargeAssignment } = require('/home/mayowae/public_html/alphaweb/backend/models');
(async () => {
  const wallets = await CustomerWallet.findAll();
  console.log('Found wallets:', wallets.length);
  
  for (const w of wallets) {
    const approvedRemits = await Remittance.sum('amount', {
      where: { customerId: w.customerId, status: 'Approved' }
    }) || 0;
    
    const charges = await ChargeAssignment.sum('amount', {
      where: { customerId: w.customerId }
    }) || 0;

    console.log(\`Wallet #\${w.id} Customer #\${w.customerId}: Current balance=\${w.balance}, collectionBalance=\${w.collectionBalance}, approvedRemits=\${approvedRemits}, charges=\${charges}\`);

    if (parseFloat(w.balance) > 0 && approvedRemits > 0) {
      const remitAmt = parseFloat(approvedRemits);
      const currentLive = parseFloat(w.balance);
      const currentCol = parseFloat(w.collectionBalance);

      const newLive = Math.max(0, currentLive - remitAmt);
      const newCol = currentCol + remitAmt;

      console.log(\`  -> REPAIRING Wallet #\${w.id}: Live \${currentLive} -> \${newLive}, Collection \${currentCol} -> \${newCol}\`);
      await w.update({
        balance: newLive,
        collectionBalance: newCol
      });
    }
  }
  console.log('Repair complete!');
  process.exit(0);
})();
"
"""
    run(client, repair_cmd, "Repair wallet balances")

    client.close()
    print("\n=== ALL DONE! Deploy and wallet repair complete ===")
