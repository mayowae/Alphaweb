import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run_psql(cmd):
    stdin, stdout, stderr = client.exec_command(f'sudo -u postgres psql alphaweb -c "{cmd}"')
    return stdout.read().decode('utf-8')

print("Schema of customer_wallets:")
print(run_psql("\\d customer_wallets"))

client.close()
