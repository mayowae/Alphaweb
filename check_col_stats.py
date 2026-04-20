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
        const { Collection } = require('./models');
        const { Sequelize } = require('sequelize');
        async function run() {
            const stats = await Collection.findAll({
                attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
                group: ['status']
            });
            const sample = await Collection.findAll({ limit: 5 });
            
            console.log(JSON.stringify({
                stats,
                sample
            }));
            process.exit(0);
        }
        run();
        """
        
        remote_path = '/home/mayowae/public_html/alphaweb/backend/check_col_stats.js'
        with ssh.open_sftp() as sftp:
            with sftp.file(remote_path, 'w') as f:
                f.write(node_script)
        
        stdin, stdout, stderr = ssh.exec_command(f'cd /home/mayowae/public_html/alphaweb/backend && node check_col_stats.js')
        out = stdout.read().decode().strip()
        
        if out:
            data = json.loads(out)
            print("Collection Status Stats:")
            for s in data['stats']:
                print(f"Status: {s['status']}, Count: {s['count']}")
            print("\nSample Collections:")
            for c in data['sample']:
                print(f"ID: {c['id']}, Name: {c['customerName']}, Amount: {c['amount']}, Status: {c['status']}")
        else:
            print("No output")
            
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_db_query()
