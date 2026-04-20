import paramiko
import json

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

def run_db_query():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname, port, username, password)
        
        node_script = """
        const { Collection, Remittance } = require('./models');
        async function run() {
            const collectedCount = await Collection.count({ where: { status: 'Collected' } });
            const pendingRemittances = await Remittance.count({ where: { status: 'Pending' } });
            const allRemittances = await Remittance.count();
            const sampleRemittances = await Remittance.findAll({ limit: 5 });
            
            console.log(JSON.stringify({
                collectedCount,
                pendingRemittances,
                allRemittances,
                sampleRemittances
            }));
            process.exit(0);
        }
        run();
        """
        
        remote_path = '/home/mayowae/public_html/alphaweb/backend/check_counts_temp.js'
        with ssh.open_sftp() as sftp:
            with sftp.file(remote_path, 'w') as f:
                f.write(node_script)
        
        stdin, stdout, stderr = ssh.exec_command(f'cd /home/mayowae/public_html/alphaweb/backend && node check_counts_temp.js')
        out = stdout.read().decode().strip()
        
        if out:
            data = json.loads(out)
            print(f"Collected Collections: {data['collectedCount']}")
            print(f"Pending Remittances: {data['pendingRemittances']}")
            print(f"Total Remittances: {data['allRemittances']}")
            print("\nSample Remittances:")
            for r in data['sampleRemittances']:
                print(f"ID: {r['id']}, Customer: {r['customerName']}, Amount: {r['amount']}, Status: {r['status']}")
        else:
            print("No output")
            
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_db_query()
