import paramiko
import json

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace')

results = {
    "frontend_create_package": run("grep -rn 'Create Collection Package\\|Create Package' /home/mayowae/public_html/alphaweb/src/app 2>/dev/null | head -10"),
    "backend_delete_package": run("grep -rn 'deletePackage' /home/mayowae/public_html/alphaweb/backend/controllers/packageController.js 2>/dev/null")
}

with open("search_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)

client.close()
