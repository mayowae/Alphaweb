import socket

domains = [
    'modoniteintegrated.com.ng',
    'alphakolect.com',
    'paxalphaltd.com',
    'bhislass.com'
]

for domain in domains:
    try:
        ip = socket.gethostbyname(domain)
        print(f"{domain} -> {ip}")
    except:
        print(f"{domain} -> Resolution failed")
