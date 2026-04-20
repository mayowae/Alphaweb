import paramiko

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)

log = open('push_page_output.txt', 'w', encoding='utf-8')

def run(cmd):
    stdin, stdout, stderr = client.exec_command(cmd)
    return stdout.read().decode('utf-8', errors='replace') + stderr.read().decode('utf-8', errors='replace')

def p(msg):
    log.write(str(msg) + '\n')
    log.flush()

# Upload the fixed page
sftp = client.open_sftp()
sftp.put(
    r'C:\Users\trade\Documents\Alphaweb-main\src\app\dashboard\(pages)\subscription\page.tsx',
    '/home/mayowae/public_html/alphaweb/src/app/dashboard/(pages)/subscription/page.tsx'
)
sftp.close()
p("Step 1: Uploaded fixed subscription page.tsx")

# Run build in background
client.exec_command('cd /home/mayowae/public_html/alphaweb && npm run build > build_output.log 2>&1')
p("Step 2: Build started in background.")
p("Run 'python check_build.py' in a couple of minutes to check build status.")

log.close()
print("Done - see push_page_output.txt")
client.close()
