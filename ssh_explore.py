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
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    return out, err

results = {}

results['src'] = run("ls /home/mayowae/public_html/alphaweb/src/")[0]
results['backend'] = run("ls /home/mayowae/public_html/alphaweb/backend/")[0]
results['src_app'] = run("ls /home/mayowae/public_html/alphaweb/src/app/")[0]
results['layout'] = run("find /home/mayowae/public_html/alphaweb/src -name 'layout*' -o -name '_document*' -o -name 'index.html' 2>/dev/null")[0]
results['collaborator_files'] = run("grep -rl 'collaborator' /home/mayowae/public_html/alphaweb/backend/ 2>/dev/null")[0]
results['backend_structure'] = run("find /home/mayowae/public_html/alphaweb/backend -name '*.ts' 2>/dev/null | head -50")[0]
results['faq_files'] = run("grep -rl -i 'faq\\|frequently' /home/mayowae/public_html/alphaweb/src/ 2>/dev/null | head -10")[0]
results['package_files'] = run("grep -rl -i 'collection.*package\\|package.*collection\\|CreatePackage\\|create_package' /home/mayowae/public_html/alphaweb/backend/ 2>/dev/null | head -15")[0]

with open('/tmp/explore_results.json', 'w') as f:
    json.dump(results, f, indent=2)

client.close()
print("Done")
