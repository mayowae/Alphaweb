import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('159.198.36.24', 22, 'root', 'yft1x2X89Z0MZrAvM9', timeout=30)
for cmd in [
    'pm2 list',
    'grep -c "updateChargeAssignmentStatus" /home/mayowae/public_html/alphaweb/services/api.tsx',
    'grep -c "collectionBalance" /home/mayowae/public_html/alphaweb/backend/models/customerWallet.js',
    'curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000',
]:
    print(f'--- {cmd} ---')
    i, o, e = ssh.exec_command(cmd)
    print(o.read().decode())
ssh.close()
