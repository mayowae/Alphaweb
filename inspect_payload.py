import paramiko

def inspect_api_payload():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('159.198.36.24', port=22, username='root', password='96eUC4aTbMu1o3yAP2')
    
    with open('inspect_payload.txt', 'w', encoding='utf-8') as f:
        node_script = """
        const { Customer, Package, Collection } = require('./models');
        Customer.findAll({
          where: { merchantId: 1 },
          attributes: ['id', 'fullName', 'packageId'],
          include: [
            {
              model: Package,
              as: 'Package',
              attributes: ['id', 'name'],
            },
            {
              model: Collection,
              as: 'Collections',
              attributes: ['packageName'],
              limit: 1,
              order: [['date_created', 'DESC']],
              separate: true
            },
          ]
        }).then(customers => {
            const mapped = customers.map(c => ({
              ...c.toJSON(),
              packageName: c.Package?.name || (c.Collections?.[0]?.packageName) || '-',
            }));
            const olubi = mapped.find(c => c.fullName === 'Olubi Johnson');
            console.log('--- OLUBI ---');
            console.log(JSON.stringify(olubi, null, 2));
            console.log('--- PACKAGES ---');
            return Package.findAll().then(pkgs => {
                const p = pkgs.map(pkg => ({id: pkg.id, name: pkg.name}));
                console.log(JSON.stringify(p, null, 2));
            });
        }).catch(e => console.error(e));
        """
        cmd = f"cd /home/mayowae/public_html/alphaweb/backend && node -e \"{node_script}\""
        stdin, stdout, stderr = ssh.exec_command(cmd)
        f.write("=== API Customer Payload ===\n")
        f.write(stdout.read().decode('utf-8', errors='replace'))
        f.write("\nERROR: " + stderr.read().decode('utf-8', errors='replace'))

    ssh.close()
    print("Done. Read inspect_payload.txt")

if __name__ == "__main__":
    inspect_api_payload()
