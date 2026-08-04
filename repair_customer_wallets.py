import paramiko

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'
PORT = 22

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOSTNAME, port=PORT, username=USERNAME, password=PASSWORD, timeout=30)
    
    cmd = """node -e "
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

    // If live wallet balance equals approvedRemits (or is greater than 0 due to erroneous remittance credit)
    if (parseFloat(w.balance) > 0 && approvedRemits > 0) {
      const remitAmt = parseFloat(approvedRemits);
      const currentLive = parseFloat(w.balance);
      const currentCol = parseFloat(w.collectionBalance);

      // Move remittance amount from Live Wallet to Collection Wallet
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
    _, stdout, stderr = client.exec_command(cmd)
    print(stdout.read().decode('utf-8', errors='replace'))
    print(stderr.read().decode('utf-8', errors='replace'))
    client.close()

if __name__ == '__main__':
    main()
