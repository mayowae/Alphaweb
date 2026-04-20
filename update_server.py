import paramiko

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

server_path = '/home/mayowae/public_html/alphaweb/backend/server.js'
content = run(f"cat {server_path}")

# Check if route already exists
if '/api/merchant/subscription' not in content:
    # Add it before Dashboard routes or after Wallet routes
    new_route = "\n// Merchant Subscription route\napp.get('/api/merchant/subscription', verifyToken, requireAuthenticated, authController.getSubscriptionInfo);\n"
    insertion_point = "app.get('/dashboard/stats'"
    if insertion_point in content:
        new_content = content.replace(insertion_point, new_route + insertion_point)
        # Write back
        # We use a temporary file to avoid escaping issues with cat >
        with open("server_new.js", "w", encoding="utf-8") as f:
            f.write(new_content)
        
        sftp = client.open_sftp()
        sftp.put("server_new.js", server_path)
        sftp.close()
        print("Route added to server.js")
    else:
        print("COULD NOT FIND INSERTION POINT IN server.js")
else:
    print("Route already exists in server.js")

client.close()
