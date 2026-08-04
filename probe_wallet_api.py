import paramiko
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

hostname = '159.198.36.24'
password = '96eUC4aTbMu1o3yAP2'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect(hostname, port=22, username='root', password=password, timeout=10)

    def run(cmd):
        stdin, stdout, stderr = client.exec_command(cmd, timeout=15)
        out = stdout.read().decode('utf-8', errors='replace')
        return out

    # Test the wallet transactions endpoint with customer ID 1
    print("=== Test /customer-wallets/1/transactions ===")
    print(run("curl -s http://localhost:5000/customer-wallets/1/transactions -H 'Authorization: Bearer test' | head -c 500"))

    # Check what wallet routes exist in the backend
    print("\n=== Wallet routes ===")
    print(run("grep -r 'customer-wallets\\|wallet.*route\\|walletTransaction' /home/mayowae/public_html/alphaweb/backend --include='*.js' -l 2>/dev/null"))

    # See the wallet routes file
    print("\n=== Wallet route file ===")
    route_file = run("find /home/mayowae/public_html/alphaweb/backend -name '*.js' | xargs grep -l 'customer-wallets\\|walletTrans' 2>/dev/null | head -3")
    print(route_file)
    
    for f in route_file.strip().split('\n'):
        if f.strip():
            print(f"\n--- {f} ---")
            print(run(f"grep -n 'transaction\\|route\\|get\\|router' {f.strip()} | head -30"))

    client.close()
except Exception as e:
    print(f"Failed: {e}")
