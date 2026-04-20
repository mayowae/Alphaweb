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

results = {}

# Find the collection package creation UI file
results['collection_pkg_files'] = run("grep -rl 'Create Collection Package' /home/mayowae/public_html/alphaweb/src/app 2>/dev/null")
results['collection_page_files'] = run("find /home/mayowae/public_html/alphaweb/src/app/dashboard -name '*.tsx' | head -30")
results['collection_dir'] = run("ls /home/mayowae/public_html/alphaweb/src/app/dashboard/(pages)/collection/ 2>/dev/null")
results['package_model'] = run("cat /home/mayowae/public_html/alphaweb/backend/models/Package.js 2>/dev/null | head -80")

# Check if Customer model references package
results['customer_package_ref'] = run("grep -n 'packageId\\|PackageId\\|package_id' /home/mayowae/public_html/alphaweb/backend/models/Customer.js 2>/dev/null | head -10")
results['collection_package_field'] = run("grep -rn 'collectionDays\\|Collection Days\\|Fixed\\|Variable' /home/mayowae/public_html/alphaweb/src/app/dashboard | head -20")

with open('pkg_search.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

client.close()
print("Done")
