import paramiko

# Credentials
hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

def run_remote_command(ssh, command):
    print(f"Running: {command}")
    stdin, stdout, stderr = ssh.exec_command(command)
    print(stdout.read().decode('utf-8', 'ignore'))
    print(stderr.read().decode('utf-8', 'ignore'))

try:
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname, port, username, password, timeout=30)
    print("Connected!")

    # Check database name first
    # run_remote_command(ssh, "psql -U root -l")
    
    # Query ENUM values. I'll assume database is alpha_main or similar.
    # I'll try to find the correct DB name from .env
    run_remote_command(ssh, "grep DB_ /home/mayowae/public_html/alphaweb/backend/.env")
    
    # Run psql command
    sql = "SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_type.oid = pg_enum.enumtypid WHERE typname = 'enum_investments_status';"
    run_remote_command(ssh, f"psql -U root -d alpha_main -c \"{sql}\"")

    ssh.close()
except Exception as e:
    print(f"Error: {e}")
