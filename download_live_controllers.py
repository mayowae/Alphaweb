import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

project_dir = "/home/mayowae/public_html/alphaweb"
controllers = [
    "accountingController.js",
    "collectionController.js",
    "repaymentController.js",
    "loanController.js",
    "walletController.js",
    "investmentTransactionController.js"
]

print("Downloading live files...")
for ctrl in controllers:
    out, err = run(f"cat {project_dir}/backend/controllers/{ctrl}")
    local_name = f"live_{ctrl}"
    with open(local_name, 'w', encoding='utf-8') as f:
        f.write(out)
    print(f"Downloaded {ctrl} to {local_name} ({len(out)} bytes)")

# Also download migrations/20240209-create-accounting-tables.js
out_mig, err_mig = run(f"cat {project_dir}/backend/migrations/20240209-create-accounting-tables.js")
with open("live_migration_accounting.js", "w", encoding="utf-8") as f:
    f.write(out_mig)
print("Downloaded live migration file")

client.close()
print("Done!")
