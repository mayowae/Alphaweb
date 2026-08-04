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
const { Customer, InvestmentApplication, Package, InvestmentTransaction } = require('/home/mayowae/public_html/alphaweb/backend/models');
(async () => {
  const cust = await Customer.findOne({ where: { fullName: 'Ado Bayero' } });
  console.log('Customer:', cust ? cust.toJSON() : 'Not found');
  if (cust) {
    const apps = await InvestmentApplication.findAll({ where: { customerId: cust.id } });
    console.log('Investment Applications:', apps.map(a => a.toJSON()));
    const pkgs = await Package.findAll({ where: { packageCategory: 'Investment' } });
    console.log('Investment Packages:', pkgs.map(p => ({ id: p.id, name: p.name, amount: p.amount, seedAmount: p.seedAmount, duration: p.duration })));
    const txs = await InvestmentTransaction.findAll({ where: { customerId: cust.id } });
    console.log('Transactions:', txs.map(t => t.toJSON()));
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
