import paramiko

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('159.198.36.24', 22, 'root', '96eUC4aTbMu1o3yAP2')

print("Checking branch...")
stdin, stdout, stderr = client.exec_command('cd /home/mayowae/public_html/alphaweb && git branch')
print(stdout.read().decode('utf-8'))

print("Pushing HEAD to main...")
stdin, stdout, stderr = client.exec_command('cd /home/mayowae/public_html/alphaweb && git push origin HEAD:main')
print(stdout.read().decode('utf-8'))
print(stderr.read().decode('utf-8'))

client.close()
