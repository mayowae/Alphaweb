import socket

def check_port(ip, port):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(5)
    try:
        s.connect((ip, port))
        print(f"Port {port} is OPEN on {ip}")
        s.close()
        return True
    except Exception as e:
        print(f"Port {port} is CLOSED or Filtered on {ip}: {e}")
        return False

check_port('159.198.36.24', 22)
check_port('159.198.36.24', 80)
check_port('159.198.36.24', 443)
check_port('159.198.36.24', 5000)
check_port('159.198.36.24', 3000)
