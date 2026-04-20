import paramiko
import os

hostname = '159.198.36.24'
port = 22
username = 'root'
password = 'Xr2J2Wx9Unk0l7rI1C'

files_to_upload = [
    ("C:\\Users\\trade\\Documents\\Alphaweb-main\\local_edit\\merchant_model.js", "/home/mayowae/public_html/alphaweb/backend/models/merchant.js"),
    ("C:\\Users\\trade\\Documents\\Alphaweb-main\\local_edit\\models_index.js", "/home/mayowae/public_html/alphaweb/backend/models/index.js"),
    ("C:\\Users\\trade\\Documents\\Alphaweb-main\\local_edit\\subscription_model.js", "/home/mayowae/public_html/alphaweb/backend/models/subscription.js"),
    ("C:\\Users\\trade\\Documents\\Alphaweb-main\\local_edit\\auth_controller.js", "/home/mayowae/public_html/alphaweb/backend/controllers/authController.js"),
    ("C:\\Users\\trade\\Documents\\Alphaweb-main\\local_edit\\merchantManagement_controller.js", "/home/mayowae/public_html/alphaweb/backend/controllers/merchantManagementController.js"),
    ("C:\\Users\\trade\\Documents\\Alphaweb-main\\local_edit\\billingService.js", "/home/mayowae/public_html/alphaweb/backend/services/billingService.js"),
    ("C:\\Users\\trade\\Documents\\Alphaweb-main\\local_edit\\run-billing.js", "/home/mayowae/public_html/alphaweb/backend/scripts/run-billing.js"),
    ("C:\\Users\\trade\\Documents\\Alphaweb-main\\local_edit\\migrate_subscriptions.js", "/home/mayowae/public_html/alphaweb/backend/migrate_subscriptions.js"),
    ("C:\\Users\\trade\\Documents\\Alphaweb-main\\local_edit\\seed_new_plans.js", "/home/mayowae/public_html/alphaweb/backend/seed_new_plans.js")
]

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(hostname, port=port, username=username, password=password, timeout=30)
sftp = client.open_sftp()

for local, remote in files_to_upload:
    print(f"Uploading {local} to {remote}...")
    sftp.put(local, remote)
    print("Done.")

sftp.close()
client.close()
