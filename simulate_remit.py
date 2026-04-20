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
        const { Collection, Remittance, Customer } = require('./models');
        async function run() {
            try {
                // Find that pending collection
                const col = await Collection.findOne({ where: { status: 'Pending' } });
                if (!col) {
                    console.log("No pending collection found");
                    process.exit(0);
                }
                
                console.log("Updating collection ID " + col.id + " to Collected");
                await col.update({ status: 'Collected', collectedDate: new Date() });
                
                // Now check if a remittance was created (normally this happens in the controller, 
                // but if we call col.update it might trigger hooks if we have them)
                // Wait, the remittance creation is in the CONTROLLER, not a model hook.
                // So updating here won't create it unless I do it manually.
                
                const customer = await Customer.findByPk(col.customerId);
                const remit = await Remittance.create({
                    collectionId: col.id,
                    customerId: col.customerId,
                    customerName: col.customerName,
                    amount: col.amount,
                    agentId: customer ? customer.agentId : null,
                    merchantId: col.merchantId,
                    status: 'Pending',
                    notes: 'Manually created for testing'
                });
                
                console.log("Created Remittance ID: " + remit.id);
                process.exit(0);
            } catch (e) {
                console.error(e);
                process.exit(1);
            }
        }
        run();
        """
        
        remote_path = '/home/mayowae/public_html/alphaweb/backend/test_remit.js'
        with ssh.open_sftp() as sftp:
            with sftp.file(remote_path, 'w') as f:
                f.write(node_script)
        
        stdin, stdout, stderr = ssh.exec_command(f'cd /home/mayowae/public_html/alphaweb/backend && node test_remit.js')
        print(stdout.read().decode().strip())
        
        ssh.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_db_query()
