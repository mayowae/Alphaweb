#!/usr/bin/env python3
"""
API Authentication Helper for AlphaKolect API
Handles token management, refresh, and API calls
"""

import requests
import json
import time
from datetime import datetime
import jwt
from typing import Optional, Dict, Any

class AlphaKolectAPI:
    def __init__(self, base_url: str = "http://alphakolect.com"):
        self.base_url = base_url
        self.token = None
        self.refresh_token = None
        self.session = requests.Session()
        
    def login(self, email: str, password: str) -> bool:
        """
        Authenticate and get access token
        """
        try:
            login_data = {
                "email": email,
                "password": password
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.refresh_token = data.get("refresh_token")
                print("✅ Login successful!")
                return True
            else:
                print(f"❌ Login failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Login error: {str(e)}")
            return False
    
    def is_token_valid(self) -> bool:
        """
        Check if current token is valid and not expired
        """
        if not self.token:
            return False
            
        try:
            # Decode token without verification to check expiration
            decoded = jwt.decode(self.token, options={"verify_signature": False})
            exp_timestamp = decoded.get("exp", 0)
            current_timestamp = int(time.time())
            
            # Add 5 minute buffer to account for clock differences
            return exp_timestamp > (current_timestamp + 300)
            
        except Exception as e:
            print(f"❌ Token validation error: {str(e)}")
            return False
    
    def refresh_access_token(self) -> bool:
        """
        Refresh the access token using refresh token
        """
        if not self.refresh_token:
            print("❌ No refresh token available")
            return False
            
        try:
            refresh_data = {
                "refresh_token": self.refresh_token
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/refresh",
                json=refresh_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                print("✅ Token refreshed successfully!")
                return True
            else:
                print(f"❌ Token refresh failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Token refresh error: {str(e)}")
            return False
    
    def get_customers(self) -> Optional[Dict[str, Any]]:
        """
        Get customers list from API
        """
        if not self.token:
            print("❌ No token available. Please login first.")
            return None
            
        if not self.is_token_valid():
            print("⚠️ Token expired. Attempting to refresh...")
            if not self.refresh_access_token():
                print("❌ Failed to refresh token. Please login again.")
                return None
        
        try:
            headers = {
                "accept": "application/json",
                "Authorization": f"Bearer {self.token}"
            }
            
            response = self.session.get(
                f"{self.base_url}/api/customers",
                headers=headers
            )
            
            if response.status_code == 200:
                print("✅ Customers retrieved successfully!")
                return response.json()
            else:
                print(f"❌ API call failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ API call error: {str(e)}")
            return None
    
    def test_connection(self) -> bool:
        """
        Test API connection and authentication
        """
        print("🔍 Testing API connection...")
        
        # Test basic connectivity
        try:
            response = self.session.get(f"{self.base_url}/api/health", timeout=10)
            if response.status_code == 200:
                print("✅ API is reachable")
            else:
                print(f"⚠️ API responded with status: {response.status_code}")
        except Exception as e:
            print(f"❌ Cannot reach API: {str(e)}")
            return False
        
        return True

def main():
    """
    Example usage of the API helper
    """
    api = AlphaKolectAPI()
    
    # Test connection first
    if not api.test_connection():
        print("❌ Cannot connect to API. Please check your internet connection and API URL.")
        return
    
    # You need to provide your actual credentials
    email = input("Enter your email: ")
    password = input("Enter your password: ")
    
    # Login
    if api.login(email, password):
        # Get customers
        customers = api.get_customers()
        if customers:
            print(f"📊 Found {len(customers)} customers")
            print(json.dumps(customers, indent=2))
        else:
            print("❌ Failed to retrieve customers")
    else:
        print("❌ Authentication failed")

if __name__ == "__main__":
    main()
