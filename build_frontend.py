import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('159.198.36.24', 22, 'root', '96eUC4aTbMu1o3yAP2')

print("Building Next.js app...")
stdin, stdout, stderr = client.exec_command('cd /home/mayowae/public_html/alphaweb && npm run build > build_output.log 2>&1')
exit_status = stdout.channel.recv_exit_status()

print("Build exit code:", exit_status)

stdin, stdout, stderr = client.exec_command('cat /home/mayowae/public_html/alphaweb/build_output.log')
log_content = stdout.read().decode('utf-8', 'ignore')

import sys
# write safely to console
sys.stdout.buffer.write(log_content.encode('utf-8'))

if exit_status == 0:
    print("Restarting alphaweb-frontend...")
    client.exec_command('pm2 restart alphaweb-frontend')
    print("Restarted.")

client.close()
