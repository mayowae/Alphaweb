import requests

BASE_URL = "https://alphakolect.com"

def test_collaborator():
    print("--- Triggering Forgot Password (Collaborator) ---")
    url = f"{BASE_URL}/collaborator/forgot-password"
    payload = {"email": "test_collab@alphakolect.com"}
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_collaborator()
