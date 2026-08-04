import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port, username, password)

def run_psql(cmd):
    stdin, stdout, stderr = client.exec_command(f"sudo -u postgres psql alphaweb -c \"{cmd}\"")
    return stdout.read().decode('utf-8')

print("Columns in customer_wallets:")
print(run_psql("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'customer_wallets';"))

client.close()
