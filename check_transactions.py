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
        const { Transaction } = require('./models');
        async function run() {
            const count = await Transaction.count();
            const samples = await Transaction.findAll({ limit: 5 });
            console.log(JSON.stringify({ count, samples }));
            process.exit(0);
        }
        run();
        """
        
        remote_path = '/home/mayowae/public_html/alphaweb/backend/check_tx_temp.js'
        with ssh.open_sftp() as sftp:
            with sftp.file(remote_path, 'w') as f:
                f.write(node_script)
        
        stdin, stdout, stderr = ssh.exec_command(f'cd /home/mayowae/public_html/alphaweb/backend && node check_tx_temp.js')
        out = stdout.read().decode().strip()
        
        if out:
            data = json.loads(out)
            print(f"Total Transactions: {data['count']}")
            for t in data['samples']:
                print(f"ID: {t['id']}, Type: {t['type']}, Amount: {t['amount']}, Status: {t['status']}")
        else:
            print("No output")
            
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_db_query()
