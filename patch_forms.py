import os

files_to_patch = [
    r'src\components\BulkCollectionForm.tsx',
    r'src\components\SingleCollectionForm.tsx'
]

for file_path in files_to_patch:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    content = content.replace("c.packageName.toLowerCase()", "c.packageName!.toLowerCase()")
    content = content.replace("customer.packageName.toLowerCase()", "customer.packageName!.toLowerCase()")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Patching complete locally. Ready to deploy via fix_frontend_502.py")
