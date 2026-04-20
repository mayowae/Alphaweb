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
        
        # We'll run a node script on the server to query the DB
        node_script = """
        const { Package } = require('./models');
        Package.findAll({ 
            attributes: ['id', 'name', 'type', 'packageCategory'],
            where: { status: 'Active' } 
        }).then(packages => {
            console.log(JSON.stringify(packages));
            process.exit(0);
        }).catch(err => {
            console.error(err);
            process.exit(1);
        });
        """
        
        # Write the script directly to the backend folder
        remote_path = '/home/mayowae/public_html/alphaweb/backend/check_pkgs_temp.js'
        with ssh.open_sftp() as sftp:
            with sftp.file(remote_path, 'w') as f:
                f.write(node_script)
        
        stdin, stdout, stderr = ssh.exec_command(f'cd /home/mayowae/public_html/alphaweb/backend && node check_pkgs_temp.js')
        out = stdout.read().decode().strip()
        err = stderr.read().decode().strip()
        
        if out:
            pkgs = json.loads(out)
            print(f"{'ID':<5} | {'Name':<25} | {'Type':<20} | {'Category':<10}")
            print("-" * 70)
            for p in pkgs:
                print(f"{p['id']:<5} | {p['name']:<25} | {p['type']:<20} | {p['packageCategory']:<10}")
        else:
            print("No output from node script")
            if err: print(f"Error: {err}")
            
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_db_query()
