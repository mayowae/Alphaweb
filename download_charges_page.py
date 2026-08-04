import paramiko
import os

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('159.198.36.24', 22, 'root', '96eUC4aTbMu1o3yAP2')
sftp = client.open_sftp()

try:
    sftp.get('/home/mayowae/public_html/alphaweb/src/app/dashboard/charges/page.tsx', 'src_dashboard_charges_page.tsx')
    print('Downloaded charges page')
except Exception as e:
    print(f'Charges page not found: {e}')

sftp.close()
client.close()
