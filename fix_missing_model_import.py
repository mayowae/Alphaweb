import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8')

index_path = '/home/mayowae/public_html/alphaweb/backend/models/index.js'
content = run(f'cat {index_path}')

# Add db.Subscription import
if 'db.Subscription' not in content:
    # Find a place to insert (after db.Remittance)
    insertion_text = "db.Remittance = require('./remittance')(sequelize, Sequelize.DataTypes);"
    new_line = "\ndb.Subscription = require('./subscription')(sequelize, Sequelize.DataTypes);"
    
    updated_content = content.replace(insertion_text, insertion_text + new_line)
    
    # Also add the association in models/index.js for consistency
    # (though I already added it to Merchant.associate, it's better to have it here too)
    assoc_insertion = "db.Merchant.hasMany(db.Transaction, { foreignKey: 'merchantId' });"
    new_assoc = "\ndb.Merchant.hasMany(db.Subscription, { foreignKey: 'merchantId', as: 'history' });\ndb.Subscription.belongsTo(db.Merchant, { foreignKey: 'merchantId' });"
    
    updated_content = updated_content.replace(assoc_insertion, assoc_insertion + new_assoc)

    with open('temp_index.js', 'w', encoding='utf-8') as f:
        f.write(updated_content)
        
    sftp = client.open_sftp()
    sftp.put('temp_index.js', index_path)
    sftp.close()
    print("Updated models/index.js with Subscription model and association")
else:
    print("Subscription model already in models/index.js")

# Restart backend
run('pm2 restart alphaweb-backend')
print("Restarted backend.")

client.close()
os.remove('temp_index.js')
