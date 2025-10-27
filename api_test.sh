#!/bin/bash

# AlphaKolect API Test Script
# This script helps you test the API with proper authentication

# Configuration
API_BASE_URL="http://alphakolect.com"
EMAIL=""
PASSWORD=""
TOKEN_FILE=".api_token"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function to get credentials
get_credentials() {
    if [ -z "$EMAIL" ]; then
        read -p "Enter your email: " EMAIL
    fi
    if [ -z "$PASSWORD" ]; then
        read -s -p "Enter your password: " PASSWORD
        echo
    fi
}

# Function to login and get token
login() {
    print_status $YELLOW "🔐 Attempting to login..."
    
    local login_response=$(curl -s -X POST \
        "${API_BASE_URL}/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")
    
    if echo "$login_response" | grep -q "access_token"; then
        local token=$(echo "$login_response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        echo "$token" > "$TOKEN_FILE"
        print_status $GREEN "✅ Login successful! Token saved."
        echo "$token"
    else
        print_status $RED "❌ Login failed: $login_response"
        return 1
    fi
}

# Function to get token (from file or login)
get_token() {
    if [ -f "$TOKEN_FILE" ]; then
        local token=$(cat "$TOKEN_FILE")
        # Check if token is still valid (basic check)
        if [ ${#token} -gt 50 ]; then
            echo "$token"
        else
            print_status $YELLOW "⚠️ Stored token appears invalid. Logging in again..."
            login
        fi
    else
        print_status $YELLOW "⚠️ No stored token found. Logging in..."
        login
    fi
}

# Function to test API connection
test_connection() {
    print_status $YELLOW "🔍 Testing API connection..."
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE_URL}/api/health" 2>/dev/null)
    
    if [ "$response" = "200" ] || [ "$response" = "404" ]; then
        print_status $GREEN "✅ API is reachable (HTTP $response)"
        return 0
    else
        print_status $RED "❌ Cannot reach API (HTTP $response)"
        return 1
    fi
}

# Function to get customers with proper authentication
get_customers() {
    local token=$(get_token)
    
    if [ -z "$token" ]; then
        print_status $RED "❌ No valid token available"
        return 1
    fi
    
    print_status $YELLOW "📊 Fetching customers..."
    
    # Corrected curl command - only one Authorization header
    local response=$(curl -s -X GET \
        "${API_BASE_URL}/api/customers" \
        -H "accept: application/json" \
        -H "Authorization: Bearer ${token}")
    
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" -X GET \
        "${API_BASE_URL}/api/customers" \
        -H "accept: application/json" \
        -H "Authorization: Bearer ${token}")
    
    if [ "$http_code" = "200" ]; then
        print_status $GREEN "✅ Customers retrieved successfully!"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        print_status $RED "❌ Failed to get customers (HTTP $http_code)"
        echo "Response: $response"
        
        if echo "$response" | grep -q "Invalid or expired token"; then
            print_status $YELLOW "🔄 Token expired. Attempting to refresh..."
            rm -f "$TOKEN_FILE"
            get_customers
        fi
    fi
}

# Function to show corrected curl command
show_corrected_curl() {
    local token=$(get_token)
    
    if [ -n "$token" ]; then
        print_status $GREEN "📋 Corrected curl command:"
        echo
        echo "curl -X 'GET' \\"
        echo "  '${API_BASE_URL}/api/customers' \\"
        echo "  -H 'accept: application/json' \\"
        echo "  -H 'Authorization: Bearer ${token}'"
        echo
    fi
}

# Main menu
show_menu() {
    echo
    print_status $GREEN "🚀 AlphaKolect API Test Tool"
    echo "1. Test API connection"
    echo "2. Login and get token"
    echo "3. Get customers"
    echo "4. Show corrected curl command"
    echo "5. Clear stored token"
    echo "6. Exit"
    echo
}

# Main execution
main() {
    # Check if jq is available
    if ! command -v jq &> /dev/null; then
        print_status $YELLOW "⚠️ jq not found. JSON output will not be formatted."
    fi
    
    while true; do
        show_menu
        read -p "Choose an option (1-6): " choice
        
        case $choice in
            1)
                test_connection
                ;;
            2)
                get_credentials
                login
                ;;
            3)
                get_credentials
                get_customers
                ;;
            4)
                get_credentials
                show_corrected_curl
                ;;
            5)
                rm -f "$TOKEN_FILE"
                print_status $GREEN "✅ Stored token cleared"
                ;;
            6)
                print_status $GREEN "👋 Goodbye!"
                exit 0
                ;;
            *)
                print_status $RED "❌ Invalid option. Please choose 1-6."
                ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
    done
}

# Run main function
main
