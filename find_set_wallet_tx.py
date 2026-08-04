import os

file_path = r'src\app\dashboard\customer\[id]\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f, 1):
        if 'setWalletTransactions' in line:
            print(f"{i}: {line.strip()}")
