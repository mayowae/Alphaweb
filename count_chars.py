with open('src/app/dashboard/customer/[id]/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
    print(f"Braces: {{: {c.count('{')}, }}: {c.count('}')}")
    print(f"Parens: (: {c.count('(')}, ): {c.count(')')}")
    print(f"Brackets: [: {c.count('[')}, ]: {c.count(']')}")
