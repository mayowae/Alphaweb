import os

results = []
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts', '.js', '.jsx', '.css')):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    for i, line in enumerate(f, 1):
                        if 'TransactPay' in line:
                            results.append(f"{path}:{i}: {line.strip()}")
            except:
                pass

for res in results:
    print(res)
