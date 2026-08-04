with open('live_remittanceController.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'if (!wallet) {' in line:
        print(f"Match found at line {idx+1}:")
        for j in range(max(0, idx-5), min(len(lines), idx+10)):
            print(f"{j+1}: {repr(lines[j])}")
