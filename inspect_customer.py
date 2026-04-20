import paramiko

def inspect_customer():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect('159.198.36.24', port=22, username='root', password='96eUC4aTbMu1o3yAP2')
    
    with open('inspect_out.txt', 'w', encoding='utf-8') as f:
        cmd = """sudo -u postgres psql -d alphacollect_db -c "SELECT id, full_name, package_id FROM customers WHERE full_name ILIKE '%Olubi Johnson%';" """
        stdin, stdout, stderr = ssh.exec_command(cmd)
        f.write("=== DB Customer ===\n")
        f.write(stdout.read().decode('utf-8', errors='replace'))
        f.write("\nERROR: " + stderr.read().decode('utf-8', errors='replace'))
        
        # Test what the backend API returns via a local script
        node_script = """
        const { Customer, Package, Collection } = require('./models');
        Customer.findOne({ 
            where: { full_name: 'Olubi Johnson' },
            include: [Package, { model: Collection, as: 'Collections', limit: 1, order: [['date_created', 'DESC']] }]
        }).then(c => console.log(JSON.stringify(c, null, 2))).catch(e => console.error(e));
        """
        cmd2 = f"cd /home/mayowae/public_html/alphaweb/backend && node -e \"{node_script}\""
        stdin, stdout, stderr = ssh.exec_command(cmd2)
        f.write("\n\n=== Node Script Model ===\n")
        f.write(stdout.read().decode('utf-8', errors='replace'))
        f.write("\nERROR: " + stderr.read().decode('utf-8', errors='replace'))

    ssh.close()
    print("Done. Read inspect_out.txt")

if __name__ == "__main__":
    inspect_customer()
