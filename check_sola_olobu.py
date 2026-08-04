import paramiko, sys

HOSTNAME = '159.198.36.24'
USERNAME = 'root'
PASSWORD = '87E4J4dIip0r7joTRG'
PORT = 22

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOSTNAME, port=PORT, username=USERNAME, password=PASSWORD, timeout=30)
    
    cmd = """node -e "
const { CustomerWallet, Customer, Collection, Remittance } = require('/home/mayowae/public_html/alphaweb/backend/models');
(async () => {
  const cust = await Customer.findOne({ where: { fullName: 'Sola Olobu' } });
  console.log('Customer:', cust ? cust.toJSON() : 'Not found');
  if (cust) {
    const wallet = await CustomerWallet.findOne({ where: { customerId: cust.id } });
    console.log('Wallet:', wallet ? wallet.toJSON() : 'No wallet');
    const cols = await Collection.findAll({ where: { customerId: cust.id } });
    console.log('Collections count:', cols.length, cols.map(c => ({ id: c.id, amount: c.amount, status: c.status })));
    const rems = await Remittance.findAll({ where: { customerId: cust.id } });
    console.log('Remittances count:', rems.length, rems.map(r => ({ id: r.id, amount: r.amount, status: r.status })));
  }
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
