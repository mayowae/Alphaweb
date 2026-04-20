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

path = '/home/mayowae/public_html/alphaweb/components/dashboard/sidebarmenuitems.tsx'
content = run(f"cat {path}")

# Add Subscription menu item
if 'Subscription' not in content:
    new_item = '''
    {
        title:"Subscription",
        path: "/dashboard/subscription",
        icon: "/icons/sidebar.svg",
    },
'''
    # Insert before Staff Management or at the end of array
    if 'Staff Management' in content:
        new_content = content.replace('{', new_item + '    {', 12) # This is risky
    else:
        new_content = content.replace(']', new_item + ']')
    
    # Better approach: find last item before ]
    lines = content.splitlines()
    for i in range(len(lines)-1, -1, -1):
        if ']' in lines[i]:
            lines.insert(i, new_item)
            break
    
    final_content = "\\n".join(lines)
    
    with open("sidebarmenuitems_new.tsx", "w", encoding="utf-8") as f:
        f.write("\\n".join(lines))
    
    sftp = client.open_sftp()
    sftp.put("sidebarmenuitems_new.tsx", path)
    sftp.close()
    print("Sidebar updated!")

client.close()
